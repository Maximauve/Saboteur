
import { type ILogger } from '@/domain/logger/logger.interface';
import { type Board } from '@/domain/model/board';
import { type Card, CardType, Connection, type ObjectiveCard } from '@/domain/model/card';
import { Deck } from '@/domain/model/deck';
import { RoleGame } from '@/domain/model/role';
import { type UserGame } from '@/domain/model/user';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';

export class NewRoundUseCases {
  constructor(
    private readonly logger: ILogger,
    private readonly roomRepository: RoomRepository,
  ) {}

  async execute(code: string): Promise<UserGame[]> {
    const room = await this.roomRepository.getRoom(code);
    const users: UserGame[] = [];
    const roles = this.distributeRoles(room.users.length);
    const actionCards = this.prepareActionCards(); // get all cards
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
    await this.roomRepository.setRoom(code, [
      'currentRound',
      roundNumber.toString(),
    ]);

    await this.roomRepository.setRound(code, roundNumber, [
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
    const objectivePositions = [
      { x: 10, y: 2 },
      { x: 10, y: 4 },
      { x: 10, y: 6 }
    ];
  
    const cards: ObjectiveCard[] = [
      { type: 'TREASURE', ...objectivePositions[0] },
      { type: 'STONE', ...objectivePositions[1] },
      { type: 'STONE', ...objectivePositions[2] }
    ];
    
    const shuffledCards = this.shuffleArray([...cards]);
    
    const treasureIndex = shuffledCards.findIndex(card => card.type === 'TREASURE');
    
    return [shuffledCards, treasureIndex];
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
    const grid: (Card | null)[][] = Array.from({ length: 9 }, () => Array.from({ length: 13 }, () => null as Card | null));
    const startCard: Card = {
      id: crypto.randomUUID(),
      type: CardType.START,
      connections: [Connection.RIGHT, Connection.TOP, Connection.BOTTOM, Connection.LEFT],
      tools: [],
      imageUrl: "path_start.png"
    };
    grid[4][2] = startCard;
    objectiveCards.forEach((card, index) => {
      if (index < objectiveCards.length) {
        grid[card.y][card.x] = {
          id: crypto.randomUUID(),
          type: CardType.END_HIDDEN,
          connections: [Connection.BOTTOM, Connection.LEFT, Connection.TOP],
          tools: [],
          imageUrl: "back_end.png"
        };
      }
    });
    return {
      grid: grid,
      startCard: startCard,
      objectivePositions: objectiveCards,
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
