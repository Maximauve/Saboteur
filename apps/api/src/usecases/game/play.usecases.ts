import { type ILogger } from '@/domain/logger/logger.interface';
import { type Board } from '@/domain/model/board';
import { type Card, CardType, Connection } from '@/domain/model/card';
import { type Move } from '@/domain/model/move';
import { type Round } from '@/domain/model/round';
import { type UserGame, type UserSocket } from '@/domain/model/user';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { type TranslationService } from '@/infrastructure/services/translation/translation.service';

export class PlayUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository, private readonly translationService: TranslationService) {}

  async execute(code: string, user: UserSocket, move: Move): Promise<void> {
    const room = await this.roomRepository.getRoom(code);
    const round = await this.roomRepository.getRound(code);
    const realUser = round.users.find(userRound => userRound.userId === user.userId);
    if (!realUser) {
      throw new Error(await this.translationService.translate('error.USER_NOT_FOUND'));
    }
    if (realUser.hasToPlay === false) {
      throw new Error(await this.translationService.translate("error.NOT_YOUR_TURN"));
    }
    if (!move.card) {
      throw new Error(await this.translationService.translate("error.CARD_NOT_FOUND"));
    }
    if (!this.cardsInDeck(move, realUser)) {
      throw new Error(await this.translationService.translate("error.CARD_NOT_IN_HAND"));
    }
    if (!await this.isCardValid(move, round.board, realUser, code)) {
      throw new Error(await this.translationService.translate("error.CARD_CANNOT_BE_PLACED"));
    }
    this.playCard(move, round, realUser);
    this.removeCardDeck(move, realUser);
    this.drawCard(realUser, round.deck);
    realUser.hasToPlay = false;
    const currentPlayerIndex = round.users.findIndex(u => u.userId === realUser.userId);
    const nextPlayerIndex = (currentPlayerIndex + 1) % round.users.length;
    round.users[nextPlayerIndex].hasToPlay = true;
    await this.roomRepository.setRoom(`${code}:${room.currentRound}`, [
      'board',
      JSON.stringify(round.board),
      'users',
      JSON.stringify(round.users),
      'deck',
      JSON.stringify(round.deck)
    ]);
  }

  private async playCard(move: Move, round: Round, user: UserGame) {
    switch (move.card.type) {
      case CardType.BROKEN_TOOL: {
        if (move.userReceiver) {
          const receiver = round.users.find(roundUser => roundUser.userId === move.userReceiver?.userId);
          receiver?.malus.push(move.card.tools[0]);
        } else {
          throw new Error(await this.translationService.translate('error.USER_NOT_FOUND'));
        }
        break;
      }
      case CardType.COLLAPSE: {
        round.board.grid[move.y][move.x] = null;
        break;
      }
      case CardType.DEADEND:
      case CardType.PATH: {
        round.board.grid[move.x][move.y] = move.card;
        break;
      }
      case CardType.INSPECT: {
        const revealedObjective = round.objectiveCards.find(
          objectiveCard => objectiveCard.x === move.x && objectiveCard.y === move.y
        );
        
        if (!revealedObjective) {
          throw new Error(await this.translationService.translate('error.NO_OBJECTIVE_CARD_AT_POSITION'));
        }
        
        user.cardsRevealed.push({
          type: revealedObjective.type,
          x: move.x, 
          y: move.y
        });
        break;
      }
      case CardType.REPAIR_DOUBLE:
      case CardType.REPAIR_TOOL: {
        user.malus.filter(malus => !move.card.tools.includes(malus));
        break;
      }
    }
  }

  private removeCardDeck(move: Move, user: UserGame) {
    const cardIndex = user.cards.findIndex(c => c.id === move.card.id);
    if (cardIndex !== -1) {
      user.cards.splice(cardIndex, 1);
    }
  }

  private drawCard(user: UserGame, deck: Card[]) {
    if (deck.length > 0) {
      user.cards.push(deck[0]);
      deck.shift();
    }
  }

  private cardsInDeck(move: Move, user: UserGame) {
    return user.cards.some(card => card.id === move.card.id);
  }

  private isPlacementValid(board: Board, move: Move) : boolean {
    const position = {
      x: move.x,
      y: move.y
    };
    if (board.grid[position.x][position.y] !== null) {
      // Il y a déjà une carte posée à cet emplacement
      return false;
    }

    const adjascentCards: Record<string, Card|null> = {
      top: board.grid[position.x - 1] ? board.grid[position.x - 1][position.y] : null,
      bottom: board.grid[position.x + 1] ? board.grid[position.x + 1][position.y] : null,
      left: board.grid[position.x] ? board.grid[position.x][position.y - 1] : null,
      right:board.grid[position.x] ?  board.grid[position.x][position.y + 1] : null,
    };

    for (const place in adjascentCards) {
      if (adjascentCards[place] === undefined || adjascentCards === null) {
        delete adjascentCards[place];
      }
    }

    if (Object.values(adjascentCards).length === 0) {
      // pas possible de poser une carte au milieu de rien
      return false;
    }

    // il faut que soit les deux ne se lient pas, soit les deux se lient
    if (adjascentCards.left !== null) {
      if (move.card.connections.includes(Connection.LEFT) && !adjascentCards.left.connections.includes(Connection.RIGHT)) {
        return false;
      }
      if (!move.card.connections.includes(Connection.LEFT) && adjascentCards.left.connections.includes(Connection.RIGHT)) {
        return false;
      }
    }
    if (adjascentCards.right !== null) {
      if (move.card.connections.includes(Connection.RIGHT) && !adjascentCards.right.connections.includes(Connection.LEFT)) {
        return false;
      }
      if (!move.card.connections.includes(Connection.RIGHT) && adjascentCards.right.connections.includes(Connection.LEFT)) {
        return false;
      }
    }
    if (adjascentCards.top !== null) {
      if (move.card.connections.includes(Connection.TOP) && !adjascentCards.top.connections.includes(Connection.BOTTOM)) {
        return false;
      }
      if (!move.card.connections.includes(Connection.TOP) && adjascentCards.top.connections.includes(Connection.BOTTOM)) {
        return false;
      }
    }
    if (adjascentCards.bottom !== null) {
      if (move.card.connections.includes(Connection.BOTTOM) && !adjascentCards.bottom.connections.includes(Connection.TOP)) {
        return false;
      }
      if (!move.card.connections.includes(Connection.BOTTOM) && adjascentCards.bottom.connections.includes(Connection.TOP)) {
        return false;
      }
    }
    return true;
  }

  private async isCardValid(move: Move, board: Board, user: UserGame, code: string) {
    switch (move.card.type) {
      case CardType.BROKEN_TOOL: {
        if (!move.userReceiver) {
          return false;
        }
        const userGame = await this.roomRepository.getUserGame(code, move?.userReceiver?.userId);
        if (!userGame) {
          throw new Error(await this.translationService.translate('error.USER_NOT_FOUND'));
        }
        return this.isBrokenToolValid(move.card, userGame);
      }
      case CardType.COLLAPSE: {
        return this.isCollapseValid(move, board);
      }
      case CardType.DEADEND:
      case CardType.PATH: {
        return this.isPlacementValid(board, move);
      }
      case CardType.INSPECT : {
        return this.isInspectValid(board, move, user);
      }
      case CardType.REPAIR_TOOL: {
        return this.isRepairToolValid(move.card, user);
      }
      default: {
        return true;
      }
    }
  }

  private isBrokenToolValid(card: Card, userReceiver?: UserGame) {
    return userReceiver?.malus.some(malus => !card.tools.includes(malus));
  }

  private isCollapseValid(move: Move, board: Board): boolean {
    return !!board.grid[move.y][move.x];
  }

  private isRepairToolValid(card: Card, user: UserGame) {
    return user.malus.some(malus => card.tools.includes(malus));
  }

  private isInspectValid(board: Board, move: Move, user: UserGame) {    
    const hasAlreadyRevealed = user.cardsRevealed.some(
      card => card.x === move.x && card.y === move.y
    );
    
    if (hasAlreadyRevealed) {
      return false;
    }
    const cardAtPosition = board.grid[move.x][move.y];
    return cardAtPosition?.type === CardType.END_HIDDEN;
  }

  private getFlippedConnections(connections: Connection[]): Connection[] {
    return connections.map(connection => {
      switch (connection) {
        case Connection.BOTTOM: {
          return Connection.TOP;
        }
        case Connection.LEFT: {
          return Connection.RIGHT;
        }
        case Connection.RIGHT: {
          return Connection.LEFT;
        }
        case Connection.TOP: {
          return Connection.BOTTOM;
        }
      }
    });
  }
  
}

