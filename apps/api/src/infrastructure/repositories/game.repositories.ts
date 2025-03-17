import { forwardRef, Inject, Injectable } from "@nestjs/common";

import { Board } from "@/domain/model/board";
import { Card, CardType, Connection, ObjectiveCard } from "@/domain/model/card";
import { Deck } from "@/domain/model/deck";
import { RoleGame } from "@/domain/model/role";
import { Round } from "@/domain/model/round";
import { UserGame, UserSocket } from "@/domain/model/user";
import { GameRepository } from "@/domain/repositories/gameRepositories";
import { RedisService } from "@/infrastructure/services/redis/service/redis.service";
import { TranslationService } from "@/infrastructure/services/translation/translation.service";
import { UseCaseProxy } from "@/infrastructure/usecases-proxy/usecases-proxy";
import { UsecasesProxyModule } from "@/infrastructure/usecases-proxy/usecases-proxy.module";
import { GetRoomUseCases } from "@/usecases/room/getRoom.usecases";

@Injectable()
export class DatabaseGameRepository implements GameRepository {
  constructor(
    @Inject(forwardRef(() => UsecasesProxyModule.GET_ROOM_USECASES_PROXY))
    private readonly getRoomUseCase: UseCaseProxy<GetRoomUseCases>,
    private readonly redisService: RedisService,
    private readonly translationService: TranslationService
  ) {}

  async startGame(code: string, user: UserSocket): Promise<UserGame[]> {
    const room = await this.getRoomUseCase.getInstance().execute(code);
    if (room.host.userId !== user.userId) {
      throw new Error(await this.translationService.translate("error.NOT_HOST"));
    }
    if (room.started) {
      throw new Error(await this.translationService.translate("error.ROOM_ALREADY_STARTED"));
    }
    if (room.users.length < 3) {
      throw new Error(await this.translationService.translate("error.ROOM_MIN"));
    }
    const users = await this.newRound(code);
    await this.redisService.hset(`room:${code}`, ['started', 'true']);
    return users;
  }

  async newRound(code: string): Promise<UserGame[]> {
    const room = await this.getRoomUseCase.getInstance().execute(code);
    const users: UserGame[] = [];
    const roles = this.distributeRoles(room.users.length);
    const actionCards = await this.prepareActionCards(); // get all cards
    const [objectiveCards, treasurePosition] = this.prepareObjectiveCards();
    const cardsPerPlayer = this.getCardsPerPlayer(room.users.length);
    for (const [index, user] of room.users.entries()) {
      users.push({
        ...user,
        isSaboteur: roles[index] === RoleGame.Saboteur,
        hasToPlay: index === 0,
        cards: actionCards.splice(0, cardsPerPlayer),
        malus: [],
        cardsRevealed: [],
      });
    }
    const roundNumber = room.currentRound + 1;
    await this.redisService.hset(`room:${code}`, [
      'currentRound',
      roundNumber.toString(),
    ]);

    await this.redisService.hset(`room:${code}:${roundNumber}`, [
      'users',
      JSON.stringify(users),
      'objectiveCards',
      JSON.stringify(objectiveCards),
      'treasurePosition',
      treasurePosition.toString(),
      'deck',
      JSON.stringify(actionCards),
      'board',
      JSON.stringify(this.initializeGameBoard(objectiveCards)),
      'currentTurn',
      '0',
    ]);

    return users;
  }

  async getRound(code: string, roundNumber?: number) {
    if (!roundNumber) {
      const room = await this.getRoomUseCase.getInstance().execute(code);
      roundNumber = room.currentRound;
    }
    if ((await this.redisService.exists(`room:${code}:${roundNumber}`)) === 0) {
      throw new Error(`La room ${code} n'existe pas`);
    }
    const roundData = await this.redisService.hgetall(`room:${code}:${roundNumber}`);
    return {
      users: JSON.parse(roundData.users || '[]'),
      objectiveCards: JSON.parse(roundData.objectiveCards || '[]'),
      treasurePosition: Number.parseInt(roundData.treasurePosition),
      deck: JSON.parse(roundData.deck || '[]'),
      board: JSON.parse(roundData.board || '[]'),
      currentTurn: Number.parseInt(roundData.currentTurn),
    } as Round;
  }

  async getBoard(code: string) {
    const round = await this.getRound(code);
    return round.board;
  }

  async play(code: string, user: UserGame, card: Card, x: number, y: number) {
    const room = await this.getRoomUseCase.getInstance().execute(code);
    const round = await this.getRound(code);
    const board = round.board;
    console.log(room, user);
    // la partie play à faire ici
    if (user.hasToPlay === false) {
      throw new Error(await this.translationService.translate("error.NOT_YOUR_TURN"));
    }
    if (card === undefined) {
      throw new Error(await this.translationService.translate("error.CARD_NOT_FOUND"));
    }
    if (user.cards.includes(card) === false) {
      throw new Error(await this.translationService.translate("error.CARD_NOT_IN_HAND"));
    }
    if (card.type === CardType.PATH && board.grid[x][y] !== null) {
      throw new Error(await this.translationService.translate("error.CARD_ALREADY_PLACED"));
    }
    // check if card is an action card
  

    //play card
    board.grid[x][y] = card;


  }

  private distributeRoles(playerCount: number): RoleGame[] {
    const saboteurMap: number[] = [0, 0, 0, 1, 1, 2, 2, 3, 3, 3, 4];
    
    const saboteurCount: number = saboteurMap[playerCount];
    
    const roles: RoleGame[] = [];
    
    for (let index = 0; index < saboteurCount; index++) {
      roles.push(RoleGame.Saboteur);
    }
    
    const nainCount = playerCount - saboteurCount + 1;
    for (let index = 0; index < nainCount; index++) {
      roles.push(RoleGame.Nain);
    }
    
    return this.shuffleArray(roles);
  }

  private prepareActionCards(): Card[] {
    const deck = new Deck().getDeck();

    return this.shuffleArray(deck);
  }

  private prepareObjectiveCards(): [ObjectiveCard[], number] {
    const cards: ObjectiveCard[] = [
      { type: 'TREASURE' },
      { type: 'STONE' },
      { type: 'STONE' }
    ];
    
    const shuffledCards = this.shuffleArray([...cards]);
    
    const treasurePosition = shuffledCards.findIndex(card => card.type === 'TREASURE');
    
    return [shuffledCards, treasurePosition];
  }

  private getCardsPerPlayer(playerCount: number): number {
    if (playerCount <= 5) {
      return 6;
    }
    if (playerCount <= 7) {
      return 5;
    }
    return 4;
  }

  private initializeGameBoard(objectiveCards: ObjectiveCard[]): Board {    
    const grid: (Card | null)[][] = Array.from({ length: 7 }, () => Array.from({ length: 11 }, () => null as Card | null));
    const startCard: Card = {
      type: CardType.START,
      connections: [Connection.RIGHT, Connection.TOP, Connection.BOTTOM, Connection.LEFT],
      tools: [],
      x: 1,
      y: 3,
      imageUrl: "path_start.png"
    };
    grid[startCard.y][startCard.x] = startCard;
    const objectivePositions = [
      { x: 9, y: 1 },
      { x: 9, y: 3 },
      { x: 9, y: 5 }
    ];
    objectivePositions.forEach((pos, index) => {
      if (index < objectiveCards.length) {
        grid[pos.y][pos.x] = {
          type: CardType.END_HIDDEN,
          connections: [Connection.BOTTOM, Connection.LEFT, Connection.TOP],
          x: pos.x,
          y: pos.y,
          tools: [],
          imageUrl: "back_end.png"
        };
      }
    });
    return {
      grid: grid,
      startCard: startCard,
      objectivePositions: [
        { x: 10, y: 2 },
        { x: 10, y: 4 },
        { x: 10, y: 6 }
      ],
    };
  }

  private cardIsValid(card: Card, board: Board, user: UserGame, userReceiver?: UserGame) {
    switch (card.type) {
      case CardType.BROKEN_TOOL: {
        return this.isBrokenToolValid(card, userReceiver);
      }
      case CardType.COLLAPSE: {
        return this.isCollapseValid(card, board);
      }
      case CardType.PATH: {
        return this.isPathValid(card, board);
      }
      case CardType.REPAIR_TOOL: {
        return this.isRepairToolValid(card, user);
      }
      default: {
        return false;
      }
    }
  }

  private isPathValid(card: Card, board: Board): boolean {
    const x = card.x;
    const y = card.y;
    const connections = card.connections;
  
    // Vérifie que la carte est connectée à une autre carte sur le plateau
    if (connections.includes(Connection.TOP) && y > 0 && board.grid[y - 1][x] !== null) {
      const topCard = board.grid[y - 1][x];
      if (!topCard?.connections.includes(Connection.BOTTOM)) {
        return false;
      }
    }
    if (connections.includes(Connection.BOTTOM) && y < board.grid.length - 1 && board.grid[y + 1][x] !== null) {
      const bottomCard = board.grid[y + 1][x];
      if (!bottomCard?.connections.includes(Connection.TOP)) {
        return false;
      }
    }
    if (connections.includes(Connection.LEFT) && x > 0 && board.grid[y][x - 1] !== null) {
      const leftCard = board.grid[y][x - 1];
      if (!leftCard?.connections.includes(Connection.RIGHT)) {
        return false;
      }
    }
    if (connections.includes(Connection.RIGHT) && x < board.grid[0].length - 1 && board.grid[y][x + 1] !== null) {
      const rightCard = board.grid[y][x + 1];
      if (!rightCard?.connections.includes(Connection.LEFT)) {
        return false;
      }
    }
  
    // vérifie que la carte ne coupe pas un chemin existant
    const existingPath = this.getExistingPath(board, x, y);
    if (existingPath !== null && !connections.includes(existingPath)) {
      return false;
    }
  
    return true;
  }

  private getExistingPath(board: Board, x: number, y: number): Connection | null {
    const card = board.grid[y][x];
    if (card === null) {
      return null;
    }
  
    if (card.connections.includes(Connection.TOP) && y > 0 && board.grid[y - 1][x] !== null) {
      return Connection.TOP;
    }
    if (card.connections.includes(Connection.BOTTOM) && y < board.grid.length - 1 && board.grid[y + 1][x] !== null) {
      return Connection.BOTTOM;
    }
    if (card.connections.includes(Connection.LEFT) && x > 0 && board.grid[y][x - 1] !== null) {
      return Connection.LEFT;
    }
    if (card.connections.includes(Connection.RIGHT) && x < board.grid[0].length - 1 && board.grid[y][x + 1] !== null) {
      return Connection.RIGHT;
    }
  
    return null;
  }

  private isBrokenToolValid(card: Card, userReceiver?: UserGame) {
    return userReceiver?.malus.some(malus => !card.tools.includes(malus));
  }

  private isCollapseValid(card: Card, board: Board): boolean {
    const existingPath = this.getExistingPath(board, card.x, card.y);
    return existingPath !== null;
  }

  private isRepairToolValid(card: Card, user: UserGame) {
    return user.malus.some(malus => card.tools.includes(malus));
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let index = shuffled.length - 1; index > 0; index--) {
      const secondIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[secondIndex]] = [shuffled[secondIndex], shuffled[index]];
    }
    return shuffled;
  }
}



