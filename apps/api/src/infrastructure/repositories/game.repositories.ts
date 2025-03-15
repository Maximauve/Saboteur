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
    console.log(round.board);
    return round.board;
  }

  private distributeRoles(playerCount: number): RoleGame[] {
    const saboteurMap: number[] = [0, 0, 0, 1, 1, 2, 2, 3, 3, 3, 3];
    
    const saboteurCount: number = playerCount < saboteurMap.length 
      ? saboteurMap[playerCount] 
      : Math.max(1, Math.floor(playerCount / 3));
    
    const roles: RoleGame[] = [];
    
    for (let index = 0; index < saboteurCount; index++) {
      roles.push(RoleGame.Saboteur);
    }
    
    const nainCount = playerCount - saboteurCount;
    for (let index = 0; index < nainCount; index++) {
      roles.push(RoleGame.Nain);
    }
    
    return this.shuffleArray(roles);
  }

  private prepareActionCards(): Card[] {
    const deck = new Deck().getDeck();
    return deck;
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
    if (playerCount <= 3) {
      return 6;
    }
    if (playerCount <= 5) {
      return 5;
    }
    if (playerCount <= 7) {
      return 4;
    }
    return 3;
  }

  private initializeGameBoard(objectiveCards: ObjectiveCard[]): Board {    
    const grid: (Card | null)[][] = Array.from({ length: 9 }, () => Array.from({ length: 13 }, () => null as Card | null));
    const startCard: Card = {
      type: CardType.START,
      connections: [Connection.RIGHT, Connection.TOP, Connection.BOTTOM],
      tools: [],
      x: 2,
      y: 4,
      imageUrl: "path_start.png"
    };
    grid[startCard.y][startCard.x] = startCard;
    const objectivePositions = [
      { x: 10, y: 2 },
      { x: 10, y: 4 },
      { x: 10, y: 6 }
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

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let index = shuffled.length - 1; index > 0; index--) {
      const secondIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[secondIndex]] = [shuffled[secondIndex], shuffled[index]];
    }
    return shuffled;
  }
}



