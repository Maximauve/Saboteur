import { type ILogger } from '@/domain/logger/logger.interface';
import { type Board } from '@/domain/model/board';
import { type Card, Connection } from '@/domain/model/card';
import { type Move, type PlacedMove } from '@/domain/model/move';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { type TranslationService } from '@/infrastructure/services/translation/translation.service';

export class PlaceCardUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository, private readonly translationService: TranslationService) {}

  async execute(code: string, move: Move): Promise<void> {
    const round = await this.roomRepository.getRound(code);

    if (move.card.isFlipped) {
      move.card.connections = this.getFlippedConnections(move.card.connections);
    }

    if (!this.isPlacementValid(round.board, move)) {
      throw new Error(await this.translationService.translate("error.CARD_CANNOT_BE_PLACED"));
    }


    round.board.grid[move.x][move.y] = move.card;

    await this.roomRepository.setRound(code, round.index, [
      'board', JSON.stringify(round.board),
      'users', JSON.stringify(round.users),
      'deck' , JSON.stringify(round.deck)
    ]);
  }

  private isPlacementValid(board: Board, move: Move) : move is PlacedMove {
    if (move.x === undefined || move.y === undefined) {
      return false;
    }

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

