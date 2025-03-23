import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { Round } from '@/domain/model/round';
import { UserSocket, UserGame } from '@/domain/model/user';
import { Board } from '@/domain/model/board';
import { Card } from '@/domain/model/card';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { TranslationService } from '@/infrastructure/services/translation/translation.service';
import { NextUserUseCases } from '@/usecases/game/nextUser.usecases';

describe('NextUserUseCases', () => {
  let nextUserUseCases: NextUserUseCases;
  let loggerMock: ILogger;
  let roomRepositoryMock: RoomRepository;
  let translationServiceMock: TranslationService;

  const mockCode = 'TEST123';
  const mockUser: UserSocket = {
    userId: 'user1', socketId: 'socket1',
    ready: false,
    gold: 0,
    username: '',
    isHost: false
  };

  const mockUsers: UserGame[] = [
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
    },
    {
      userId: 'user3',
      username: 'User 3',
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

  const mockBoard: Board = {
    grid: [],
    startCard: {} as Card,
    objectivePositions: []
  };

  const mockDeck: Card[] = [];

  const mockRound: Round = {
    index: 1,
    users: [...mockUsers],
    board: mockBoard,
    deck: mockDeck,
    objectiveCards: [],
    treasurePosition: 0,
    goldList: [],
    revealedCards: []
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
      getRound: jest.fn().mockResolvedValue(mockRound),
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

    nextUserUseCases = new NextUserUseCases(
      loggerMock,
      roomRepositoryMock,
      translationServiceMock
    );
  });

  describe('execute', () => {
    it('should set hasToPlay to false for current user and true for next user', async () => {
      const testRound = JSON.parse(JSON.stringify(mockRound)) as Round;
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(testRound);
      
      await nextUserUseCases.execute(mockCode, mockUser);
      
      expect(testRound.users[0].hasToPlay).toBe(false);
      expect(testRound.users[1].hasToPlay).toBe(true);
      expect(testRound.users[2].hasToPlay).toBe(false);
    });

    it('should wrap around to the first user when current user is the last one', async () => {
      const lastUserRound = JSON.parse(JSON.stringify(mockRound)) as Round;
      lastUserRound.users[0].hasToPlay = false;
      lastUserRound.users[1].hasToPlay = false;
      lastUserRound.users[2].hasToPlay = true;
      
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(lastUserRound);
      
      await nextUserUseCases.execute(mockCode, {
        userId: 'user3', socketId: 'socket3',
        ready: false,
        gold: 0,
        username: '',
        isHost: false
      });
      
      expect(lastUserRound.users[0].hasToPlay).toBe(true);
      expect(lastUserRound.users[1].hasToPlay).toBe(false);
      expect(lastUserRound.users[2].hasToPlay).toBe(false);
    });

    it('should update the round in the repository', async () => {
      const testRound = JSON.parse(JSON.stringify(mockRound)) as Round;
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(testRound);
      
      await nextUserUseCases.execute(mockCode, mockUser);
      
      expect(roomRepositoryMock.setRound).toHaveBeenCalledWith(
        mockCode,
        testRound.index,
        [
          'board',
          JSON.stringify(testRound.board),
          'users',
          JSON.stringify(testRound.users),
          'deck',
          JSON.stringify(testRound.deck)
        ]
      );
    });

    it('should handle the case where user is not found in the round', async () => {
      // Setup - create a round where the user doesn't exist
      const testRound = JSON.parse(JSON.stringify(mockRound)) as Round;
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(testRound);
      
      const nonExistentUser: UserSocket = {
        userId: 'nonexistent', socketId: 'socket-nonexistent',
        ready: false,
        gold: 0,
        username: '',
        isHost: false
      };
      
      await expect(nextUserUseCases.execute(mockCode, nonExistentUser))
        .rejects
        .toThrow();
    });

    it('should handle rounds with only one user', async () => {
      const singleUserRound = JSON.parse(JSON.stringify(mockRound)) as Round;
      singleUserRound.users = [singleUserRound.users[0]];
      
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(singleUserRound);
      
      await nextUserUseCases.execute(mockCode, mockUser);
      
      expect(singleUserRound.users[0].hasToPlay).toBe(true);
      expect(roomRepositoryMock.setRound).toHaveBeenCalled();
    });

    it('should work correctly when the current user is in the middle of the users array', async () => {
      const middleUserRound = JSON.parse(JSON.stringify(mockRound)) as Round;
      middleUserRound.users[0].hasToPlay = false;
      middleUserRound.users[1].hasToPlay = true;
      middleUserRound.users[2].hasToPlay = false;
      
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(middleUserRound);
      
      await nextUserUseCases.execute(mockCode, {
        userId: 'user2', socketId: 'socket2',
        ready: false,
        gold: 0,
        username: '',
        isHost: false
      });
      
      expect(middleUserRound.users[0].hasToPlay).toBe(false);
      expect(middleUserRound.users[1].hasToPlay).toBe(false);
      expect(middleUserRound.users[2].hasToPlay).toBe(true);
    });

    it('should handle repository errors properly', async () => {
      const mockError = new Error('Repository error');
      (roomRepositoryMock.getRound as jest.Mock).mockRejectedValue(mockError);
      
      await expect(nextUserUseCases.execute(mockCode, mockUser)).rejects.toThrow(mockError);
    });

    it('should work with different room codes', async () => {
      const differentCode = 'DIFF456';
      const testRound = JSON.parse(JSON.stringify(mockRound)) as Round;
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(testRound);
      
      await nextUserUseCases.execute(differentCode, mockUser);
      
      expect(roomRepositoryMock.getRound).toHaveBeenCalledWith(differentCode);
      expect(roomRepositoryMock.setRound).toHaveBeenCalledWith(
        differentCode,
        testRound.index,
        expect.any(Array)
      );
    });

    it('should not modify any parts of the round other than user status', async () => {
      const testRound = JSON.parse(JSON.stringify(mockRound)) as Round;
      testRound.board = { 
        grid: [[{ id: 'card1' } as Card]], 
        startCard: { id: 'start' } as Card,
        objectivePositions: [{
          x: 1, y: 1, type: 'TREASURE',
          id: '',
          connections: []
        }]
      };
      testRound.deck = [{ id: 'deck1' } as Card];
      
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(testRound);
      
      await nextUserUseCases.execute(mockCode, mockUser);
      
      expect(testRound.board).toEqual({
        grid: [[{ id: 'card1' }]],
        startCard: { id: 'start' },
        objectivePositions: [{ x: 1, y: 1, type: 'TREASURE', id: '',
          connections: [] }]
      });
      expect(testRound.deck).toEqual([{ id: 'deck1' }]);
    });
  });
});
