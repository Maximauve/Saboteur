import { ILogger } from '@/domain/logger/logger.interface';
import { Board } from '@/domain/model/board';
import { Card, CardType, ObjectiveCard } from '@/domain/model/card';
import { Deck } from '@/domain/model/deck';
import { UserRoom, UserSocket } from '@/domain/model/user';
import { Room } from '@/domain/model/room';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { NewRoundUseCases } from '@/usecases/game/newRound.usecases';

const mockUUID = 'test-uuid';
global.crypto = {
  ...global.crypto,
  randomUUID: jest.fn().mockReturnValue(mockUUID)
};

describe('NewRoundUseCases', () => {
  let newRoundUseCases: NewRoundUseCases;
  let loggerMock: ILogger;
  let roomRepositoryMock: RoomRepository;

  const mockCode = 'TEST123';

  const mockRoom: Room = {
    code: mockCode,
    users: [
      { userId: 'user1', username: 'User 1', gold: 0 },
      { userId: 'user2', username: 'User 2', gold: 0 },
      { userId: 'user3', username: 'User 3', gold: 0 }
    ] as UserSocket[],
    currentRound: 0,
    started: true,
    host: new UserRoom,
    goldDeck: [],
    messages: []
  };

  beforeEach(async () => {
    loggerMock = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn()
    };

    roomRepositoryMock = {
      getRound: jest.fn(),
      getRoom: jest.fn().mockResolvedValue(mockRoom),
      getRoomUsers: jest.fn(),
      getSocketId: jest.fn(),
      isHost: jest.fn(),
      gameIsStarted: jest.fn(),
      doesRoomExists: jest.fn(),
      getBoard: jest.fn(),
      getDeck: jest.fn(),
      getUserGame: jest.fn(),
      setRoom: jest.fn(),
      setRound: jest.fn(),
      getCurrentRoundUser: jest.fn()
    };

    jest.spyOn(NewRoundUseCases.prototype as any, 'shuffleArray').mockImplementation((arr: any[]) => [...arr]);

    jest.spyOn(roomRepositoryMock, 'setRound');

    newRoundUseCases = new NewRoundUseCases(
      loggerMock,
      roomRepositoryMock
    );
  });

  describe('execute', () => {
    it('should create a new round with appropriate user data and board', async () => {
      const mockDeck = [
        { id: 'card1', type: CardType.PATH } as Card,
        { id: 'card2', type: CardType.PATH } as Card,
        { id: 'card3', type: CardType.PATH } as Card,
        { id: 'card4', type: CardType.PATH } as Card,
        { id: 'card5', type: CardType.PATH } as Card,
        { id: 'card6', type: CardType.PATH } as Card,
        { id: 'card7', type: CardType.PATH } as Card,
        { id: 'card8', type: CardType.PATH } as Card,
        { id: 'card9', type: CardType.PATH } as Card,
        { id: 'card10', type: CardType.PATH } as Card,
        { id: 'card11', type: CardType.PATH } as Card,
        { id: 'card12', type: CardType.PATH } as Card,
        { id: 'card13', type: CardType.PATH } as Card,
        { id: 'card14', type: CardType.PATH } as Card,
        { id: 'card15', type: CardType.PATH } as Card,
        { id: 'card16', type: CardType.PATH } as Card,
        { id: 'card17', type: CardType.PATH } as Card,
        { id: 'card18', type: CardType.PATH } as Card,
      ];
      jest.spyOn(Deck.prototype, 'getDeck').mockReturnValue(mockDeck);
      
      const result = await newRoundUseCases.execute(mockCode);
      
      expect(roomRepositoryMock.getRoom).toHaveBeenCalledWith(mockCode);
      expect(roomRepositoryMock.setRoom).toHaveBeenCalledWith(mockCode, [
        'currentRound', '1'
      ]);
      
      expect(result.length).toBe(3);
      expect(result[0].hasToPlay).toBe(true);
      expect(result[1].hasToPlay).toBe(false);
      expect(result[2].hasToPlay).toBe(false);
      
      expect(result[0].cards.length).toBe(6);
      expect(result[1].cards.length).toBe(6);
      expect(result[2].cards.length).toBe(6);
      const setRoundArgs = (roomRepositoryMock.setRound as jest.Mock).mock.calls[0];
      expect(roomRepositoryMock.setRound).toHaveBeenCalled();
      expect(setRoundArgs[0]).toBe(mockCode);
      expect(setRoundArgs[1]).toBe(1);
      
      const usersFromSetRound = JSON.parse(setRoundArgs[2][3]);
      const objectiveCardsFromSetRound = JSON.parse(setRoundArgs[2][5]);
      const deckFromSetRound = JSON.parse(setRoundArgs[2][9]);
      const boardFromSetRound = JSON.parse(setRoundArgs[2][11]);
      
      expect(usersFromSetRound.length).toBe(3);
      
      expect(objectiveCardsFromSetRound.length).toBe(3);
      expect(objectiveCardsFromSetRound.filter((card: ObjectiveCard) => card.type === 'TREASURE').length).toBe(1);
      expect(objectiveCardsFromSetRound.filter((card: ObjectiveCard) => card.type === 'COAL').length).toBe(2);
      
      expect(deckFromSetRound.length).toBe(mockDeck.length - 18);
      expect(boardFromSetRound.grid.length).toBe(9);
      expect(boardFromSetRound.grid[0].length).toBe(13);
      expect(boardFromSetRound.startCard.type).toBe(CardType.START);
      expect(boardFromSetRound.objectivePositions.length).toBe(3);
    });

    it('should distribute roles correctly based on player count', async () => {
      const threePlayerRoom = { ...mockRoom, users: mockRoom.users.slice(0, 3) };
      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(threePlayerRoom);
      
      const result = await newRoundUseCases.execute(mockCode);
      
      const saboteurCount = result.filter(user => user.isSaboteur).length;
      expect(saboteurCount).toBe(1);
      expect(result.filter(user => !user.isSaboteur).length).toBe(2);
      
      const fivePlayerRoom = {
        ...mockRoom,
        users: [
          ...mockRoom.users,
          { userId: 'user4', name: 'User 4', gold: 0 },
          { userId: 'user5', name: 'User 5', gold: 0 }
        ]
      };
      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(fivePlayerRoom);
      
      const result2 = await newRoundUseCases.execute(mockCode);
      
      const saboteurCount2 = result2.filter(user => user.isSaboteur).length;
      expect(saboteurCount2).toBe(2);
      expect(result2.filter(user => !user.isSaboteur).length).toBe(3);
    });

    it('should distribute the correct number of cards based on player count', async () => {
      const fivePlayerRoom = {
        ...mockRoom,
        users: [
          ...mockRoom.users,
          { userId: 'user4', name: 'User 4', gold: 0 },
          { userId: 'user5', name: 'User 5', gold: 0 }
        ]
      };
      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(fivePlayerRoom);
      
      const result1 = await newRoundUseCases.execute(mockCode);
      expect(result1[0].cards.length).toBe(6);
      
      const sixPlayerRoom = {
        ...mockRoom,
        users: [
          ...mockRoom.users,
          { userId: 'user4', name: 'User 4', gold: 0 },
          { userId: 'user5', name: 'User 5', gold: 0 },
          { userId: 'user6', name: 'User 6', gold: 0 }
        ]
      };
      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(sixPlayerRoom);
      
      const result2 = await newRoundUseCases.execute(mockCode);
      expect(result2[0].cards.length).toBe(5);
      
      const eightPlayerRoom = {
        ...mockRoom,
        users: [
          ...mockRoom.users,
          { userId: 'user4', name: 'User 4', gold: 0 },
          { userId: 'user5', name: 'User 5', gold: 0 },
          { userId: 'user6', name: 'User 6', gold: 0 },
          { userId: 'user7', name: 'User 7', gold: 0 },
          { userId: 'user8', name: 'User 8', gold: 0 }
        ]
      };
      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(eightPlayerRoom);
      
      const result3 = await newRoundUseCases.execute(mockCode);
      expect(result3[0].cards.length).toBe(4);
    });

    it('should initialize the game board correctly', async () => {
      const result = await newRoundUseCases.execute(mockCode);
      
      const setRoundArgs = (roomRepositoryMock.setRound as jest.Mock).mock.calls[0];
      const boardFromSetRound = JSON.parse(setRoundArgs[2][11]) as Board;
      
      expect(boardFromSetRound.grid.length).toBe(9);
      expect(boardFromSetRound.grid[0].length).toBe(13);
      
      expect(boardFromSetRound.grid[4][2]).not.toBeNull();
      expect(boardFromSetRound.grid[4][2]?.type).toBe(CardType.START);
      
      const objectivePositions = boardFromSetRound.objectivePositions;
      expect(objectivePositions.length).toBe(3);
      
      objectivePositions.forEach(pos => {
        const { x, y } = pos;
        expect(boardFromSetRound.grid[x][y]).not.toBeNull();
        expect(boardFromSetRound.grid[x][y]?.type).toBe(CardType.END_HIDDEN);
      });
    });

    it('should prepare objective cards correctly with 1 treasure and 2 coal', async () => {
      await newRoundUseCases.execute(mockCode);
      
      const setRoundArgs = (roomRepositoryMock.setRound as jest.Mock).mock.calls[0];
      const objectiveCardsFromSetRound = JSON.parse(setRoundArgs[2][5]) as ObjectiveCard[];
      
      expect(objectiveCardsFromSetRound.length).toBe(3);
      expect(objectiveCardsFromSetRound.filter(card => card.type === 'TREASURE').length).toBe(1);
      expect(objectiveCardsFromSetRound.filter(card => card.type === 'COAL').length).toBe(2);
      
      const positions = objectiveCardsFromSetRound.map(card => ({ x: card.x, y: card.y }));
      const uniquePositions = new Set(positions.map(pos => `${pos.x},${pos.y}`));
      expect(uniquePositions.size).toBe(3);
      
      const validPositions = [
        { x: 2, y: 10 },
        { x: 4, y: 10 },
        { x: 6, y: 10 }
      ];
      
      positions.forEach(pos => {
        const found = validPositions.some(valid => valid.x === pos.x && valid.y === pos.y);
        expect(found).toBe(true);
      });
    });

    it('should increment the current round number', async () => {
      await newRoundUseCases.execute(mockCode);
      
      expect(roomRepositoryMock.setRoom).toHaveBeenCalledWith(mockCode, [
        'currentRound', '1'
      ]);
      
      const secondRoundRoom = { ...mockRoom, currentRound: 1 };
      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(secondRoundRoom);
      
      await newRoundUseCases.execute(mockCode);
      
      expect(roomRepositoryMock.setRoom).toHaveBeenCalledWith(mockCode, [
        'currentRound', '2'
      ]);
    });

    it('should initialize users with correct properties', async () => {
      const result = await newRoundUseCases.execute(mockCode);
      
      result.forEach((user, index) => {
        expect(user.hasToPlay).toBe(index === 0);
        expect(user.malus).toEqual([]);
        expect(user.cardsRevealed).toEqual([]);
        expect(user.hasToChooseGold).toBe(false);
        expect(Array.isArray(user.cards)).toBe(true);
      });
      
      const hasSaboteur = result.some(user => user.isSaboteur);
      expect(hasSaboteur).toBe(true);
    });

    it('should handle errors from the repository', async () => {
      const mockError = new Error('Repository error');
      (roomRepositoryMock.getRoom as jest.Mock).mockRejectedValue(mockError);
      
      await expect(newRoundUseCases.execute(mockCode)).rejects.toThrow(mockError);
    });

    it('should handle a room with no users gracefully', async () => {
      const emptyRoom = { ...mockRoom, users: [] };
      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(emptyRoom);
      
      const result = await newRoundUseCases.execute(mockCode);
      
      expect(result).toEqual([]);
      
      expect(roomRepositoryMock.setRoom).toHaveBeenCalled();
      expect(roomRepositoryMock.setRound).toHaveBeenCalled();
    });
  });

  describe('private methods through execute', () => {
    it('should create a proper board with expected dimensions', async () => {
      await newRoundUseCases.execute(mockCode);
      
      const setRoundArgs = (roomRepositoryMock.setRound as jest.Mock).mock.calls[0];
      const boardFromSetRound = JSON.parse(setRoundArgs[2][11]) as Board;
      
      expect(boardFromSetRound.grid.length).toBe(9);
      expect(boardFromSetRound.grid[0].length).toBe(13);
    });

    it('should create an empty goldList and revealedCards array', async () => {
      await newRoundUseCases.execute(mockCode);
      
      const setRoundArgs = (roomRepositoryMock.setRound as jest.Mock).mock.calls[0];
      const goldListFromSetRound = JSON.parse(setRoundArgs[2][13]);
      const revealedCardsFromSetRound = JSON.parse(setRoundArgs[2][15]);
      
      expect(goldListFromSetRound).toEqual([]);
      expect(revealedCardsFromSetRound).toEqual([]);
    });
  });
});
