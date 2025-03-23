import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { Move, PlacedMove } from '@/domain/model/move';
import { UserSocket, UserGame } from '@/domain/model/user';
import { Round } from '@/domain/model/round';
import { Card, ObjectiveCard } from '@/domain/model/card';
import { Board } from '@/domain/model/board';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { TranslationService } from '@/infrastructure/services/translation/translation.service';
import { RevealObjectiveUseCases } from '@/usecases/game/revealObjective.usecases';

describe('RevealObjectiveUseCases', () => {
  let revealObjectiveUseCases: RevealObjectiveUseCases;
  let loggerMock: ILogger;
  let roomRepositoryMock: RoomRepository;
  let translationServiceMock: TranslationService;

  const mockCode = 'TEST123';
  
  const mockUserSocket: UserSocket = {
    userId: 'user1',
    username: 'User 1',
    socketId: '',
    ready: false,
    gold: 0,
    isHost: false
  };
  
  const createMockUsers = (): UserGame[] => [
    {
      userId: 'user1',
      username: 'User 1',
      hasToPlay: true,
      cards: [],
      isSaboteur: false,
      malus: [],
      cardsRevealed: [],
      hasToChooseGold: false,
      socketId: '',
      ready: false,
      gold: 0,
      isHost: false
    },
    {
      userId: 'user2',
      username: 'User 2',
      hasToPlay: false,
      cards: [],
      isSaboteur: false,
      malus: [],
      cardsRevealed: [],
      hasToChooseGold: false,
      socketId: '',
      ready: false,
      gold: 0,
      isHost: false
    }
  ];
  
  const mockObjectiveCards: (ObjectiveCard & { x: number, y: number })[] = [
    {
      id: 'objective1',
      type: 'TREASURE',
      isFlipped: false,
      connections: [],
      x: 5,
      y: 3
    },
    {
      id: 'objective2',
      type: 'COAL',
      isFlipped: false,
      connections: [],
      x: 7,
      y: 3
    },
    {
      id: 'objective3',
      type: 'COAL',
      isFlipped: false,
      connections: [],
      x: 9,
      y: 3
    }
  ];

  const createMockRound = (users: UserGame[], objectiveCards: (ObjectiveCard & { x: number, y: number })[]): Round => {
    return {
      index: 1,
      users,
      board: {} as Board,
      deck: [],
      objectiveCards,
      treasurePosition: 0,
      goldList: [],
      revealedCards: []
    };
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
      getRoom: jest.fn(),
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

    translationServiceMock = {
      translate: jest.fn().mockImplementation(key => Promise.resolve(key))
    } as unknown as TranslationService;

    revealObjectiveUseCases = new RevealObjectiveUseCases(
      loggerMock,
      roomRepositoryMock,
      translationServiceMock
    );
  });

  describe('execute', () => {
    it('should successfully reveal an objective card', async () => {
      const mockUsers = createMockUsers();
      const mockRound = createMockRound(mockUsers, mockObjectiveCards);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const move: PlacedMove = {
        x: 5,
        y: 3,
        card: new Card
      };
      
      await revealObjectiveUseCases.execute(mockCode, mockUserSocket, move);
      
      expect(mockUsers[0].cardsRevealed).toHaveLength(1);
      expect(mockUsers[0].cardsRevealed[0]).toEqual({
        ...mockObjectiveCards[0],
        x: 5,
        y: 3
      });
      
      expect(roomRepositoryMock.setRound).toHaveBeenCalledWith(
        mockCode,
        mockRound.index,
        [
          'board', JSON.stringify(mockRound.board),
          'users', JSON.stringify(mockRound.users),
          'deck', JSON.stringify(mockRound.deck)
        ]
      );
    });

    it('should throw an error if no objective card exists at the specified position', async () => {
      const mockUsers = createMockUsers();
      const mockRound = createMockRound(mockUsers, mockObjectiveCards);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const move: PlacedMove = {
        x: 1,
        y: 1,
        card: new Card
      };
      
      await expect(revealObjectiveUseCases.execute(mockCode, mockUserSocket, move))
        .rejects
        .toThrow('error.NO_OBJECTIVE_CARD_AT_POSITION');
      
      expect(mockUsers[0].cardsRevealed).toHaveLength(0);
      expect(roomRepositoryMock.setRound).not.toHaveBeenCalled();
    });

    it('should throw an error if the move is invalid (missing x or y)', async () => {
      const mockUsers = createMockUsers();
      const mockRound = createMockRound(mockUsers, mockObjectiveCards);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const invalidMove: Move = {
        x: 5,
        card: new Card
      };
      
      await expect(revealObjectiveUseCases.execute(mockCode, mockUserSocket, invalidMove))
        .rejects
        .toThrow('error.NO_OBJECTIVE_CARD_AT_POSITION');
      
      expect(mockUsers[0].cardsRevealed).toHaveLength(0);
      expect(roomRepositoryMock.setRound).not.toHaveBeenCalled();
      
      const anotherInvalidMove: Move = {
        y: 3,
        card: new Card
      };
      
      await expect(revealObjectiveUseCases.execute(mockCode, mockUserSocket, anotherInvalidMove))
        .rejects
        .toThrow('error.NO_OBJECTIVE_CARD_AT_POSITION');
    });

    it('should add the revealed card to the correct user', async () => {
      const mockUsers = createMockUsers();
      const mockRound = createMockRound(mockUsers, mockObjectiveCards);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const move: PlacedMove = {
        x: 7,
        y: 3,
        card: new Card
      };
      
      await revealObjectiveUseCases.execute(mockCode, mockUserSocket, move);
      
      expect(mockUsers[0].cardsRevealed).toHaveLength(1);
      expect(mockUsers[0].cardsRevealed[0]).toEqual({
        ...mockObjectiveCards[1],
        x: 7,
        y: 3
      });
      
      expect(mockUsers[1].cardsRevealed).toHaveLength(0);
      expect(roomRepositoryMock.setRound).toHaveBeenCalled();
    });

    it('should allow a user to reveal multiple objective cards', async () => {
      const mockUsers = createMockUsers();
      const mockRound = createMockRound(mockUsers, mockObjectiveCards);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const firstMove: PlacedMove = {
        x: 5,
        y: 3,
        card: new Card
      };
      
      await revealObjectiveUseCases.execute(mockCode, mockUserSocket, firstMove);
      
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const secondMove: PlacedMove = {
        x: 7,
        y: 3,
        card: new Card
      };
      
      await revealObjectiveUseCases.execute(mockCode, mockUserSocket, secondMove);
      
      expect(mockUsers[0].cardsRevealed).toHaveLength(2);
      expect(mockUsers[0].cardsRevealed).toContainEqual({
        ...mockObjectiveCards[0],
        x: 5,
        y: 3
      });
      expect(mockUsers[0].cardsRevealed).toContainEqual({
        ...mockObjectiveCards[1],
        x: 7,
        y: 3
      });
      
      expect(roomRepositoryMock.setRound).toHaveBeenCalledTimes(2);
    });

    it('should handle revealing a treasure objective', async () => {
      const mockUsers = createMockUsers();
      const mockRound = createMockRound(mockUsers, mockObjectiveCards);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const move: PlacedMove = {
        x: 5,
        y: 3,
        card: new Card
      };
      
      await revealObjectiveUseCases.execute(mockCode, mockUserSocket, move);
      
      expect(mockUsers[0].cardsRevealed).toHaveLength(1);
      expect(mockUsers[0].cardsRevealed[0].type).toBe('TREASURE');
      expect(roomRepositoryMock.setRound).toHaveBeenCalled();
    });

    it('should handle errors from the repository gracefully', async () => {
      const mockError = new Error('Repository error');
      (roomRepositoryMock.getRound as jest.Mock).mockRejectedValue(mockError);
      
      const move: PlacedMove = {
        x: 5,
        y: 3,
        card: new Card
      };
      
      await expect(revealObjectiveUseCases.execute(mockCode, mockUserSocket, move))
        .rejects
        .toThrow(mockError);
      
      expect(roomRepositoryMock.setRound).not.toHaveBeenCalled();
    });

    it('should handle a missing user in the round', async () => {
      const mockUsers = [
        {
          userId: 'differentUser',
          name: 'Different User',
          hasToPlay: true,
          cards: [],
          isSaboteur: false,
          malus: [],
          cardsRevealed: [],
          hasToChooseGold: false,
          socketId: "sokcet-id",
          ready: true,
          gold: 0,
          username: "",
          isHost: true
        }
      ];
      const mockRound = createMockRound(mockUsers, mockObjectiveCards);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const move: PlacedMove = {
        x: 5,
        y: 3,
        card: new Card
      };
      
      await expect(revealObjectiveUseCases.execute(mockCode, mockUserSocket, move))
        .rejects
        .toThrow();
      expect(roomRepositoryMock.setRound).not.toHaveBeenCalled();
    });

    it('should pass the x and y coordinates to the revealed card', async () => {
      const mockUsers = createMockUsers();
      const mockRound = createMockRound(mockUsers, mockObjectiveCards);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const specificX = 9;
      const specificY = 3;
      const move: PlacedMove = {
        x: specificX,
        y: specificY,
        card: new Card
      };
      
      await revealObjectiveUseCases.execute(mockCode, mockUserSocket, move);
      
      expect(mockUsers[0].cardsRevealed).toHaveLength(1);
      expect(mockUsers[0].cardsRevealed[0].x).toBe(specificX);
      expect(mockUsers[0].cardsRevealed[0].y).toBe(specificY);
      expect(roomRepositoryMock.setRound).toHaveBeenCalled();
    });
  });

  describe('Private method: isMoveValid', () => {
    
    it('should reject a move with missing x coordinate', async () => {
      const mockUsers = createMockUsers();
      const mockRound = createMockRound(mockUsers, mockObjectiveCards);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const invalidMove: Move = {
        y: 3,
        card: new Card
      };
      
      await expect(revealObjectiveUseCases.execute(mockCode, mockUserSocket, invalidMove))
        .rejects
        .toThrow('error.NO_OBJECTIVE_CARD_AT_POSITION');
      
      expect(roomRepositoryMock.setRound).not.toHaveBeenCalled();
    });
    
    it('should reject a move with missing y coordinate', async () => {
      const mockUsers = createMockUsers();
      const mockRound = createMockRound(mockUsers, mockObjectiveCards);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const invalidMove: Move = {
        x: 5,
        card: new Card
      };
      
      await expect(revealObjectiveUseCases.execute(mockCode, mockUserSocket, invalidMove))
        .rejects
        .toThrow('error.NO_OBJECTIVE_CARD_AT_POSITION');
      
      expect(roomRepositoryMock.setRound).not.toHaveBeenCalled();
    });
    
    it('should reject a move with null coordinates', async () => {
      const mockUsers = createMockUsers();
      const mockRound = createMockRound(mockUsers, mockObjectiveCards);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const invalidMove: Move = {
        x: null as any,
        y: null as any,
        card: new Card
      };
      
      await expect(revealObjectiveUseCases.execute(mockCode, mockUserSocket, invalidMove))
        .rejects
        .toThrow('error.NO_OBJECTIVE_CARD_AT_POSITION');
      
      expect(roomRepositoryMock.setRound).not.toHaveBeenCalled();
    });
    
    it('should accept a move with valid coordinates', async () => {
      const mockUsers = createMockUsers();
      const mockRound = createMockRound(mockUsers, mockObjectiveCards);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const validMove: PlacedMove = {
        x: 5,
        y: 3,
        card: new Card
      };
      
      await revealObjectiveUseCases.execute(mockCode, mockUserSocket, validMove);
      
      expect(mockUsers[0].cardsRevealed).toHaveLength(1);
      expect(roomRepositoryMock.setRound).toHaveBeenCalled();
    });
  });
});
