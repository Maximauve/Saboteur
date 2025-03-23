import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { Round } from '@/domain/model/round';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { GetRoundUseCases } from '@/usecases/game/getRound.usecases';
import { UserGame } from '@/domain/model/user';
import { Card } from '@/domain/model/card';

describe('GetRoundUseCases', () => {
  let getRoundUseCases: GetRoundUseCases;
  let loggerMock: ILogger;
  let roomRepositoryMock: RoomRepository;

  const mockCode = 'TEST123';
  
  const mockUser1: UserGame = {
    userId: 'user1',
    username: 'User 1',
    socketId: 'socket1',
    gold: 0,
    cards: [],
    malus: [],
    isHost: true,
    ready: true,
    isSaboteur: false,
    cardsRevealed: [],
    hasToPlay: false,
    hasToChooseGold: false
  };

  const mockUser2: UserGame = {
    userId: 'user2',
    username: 'User 2',
    socketId: 'socket2',
    gold: 0,
    cards: [],
    malus: [],
    isHost: false,
    ready: true,
    isSaboteur: false,
    cardsRevealed: [],
    hasToPlay: false,
    hasToChooseGold: false
  };

  const mockRound1: Round = {
    index: 1,
    board: {
      grid: [],
      startCard: {} as Card,
      objectivePositions: []
    },
    users: [mockUser1, mockUser2],
    deck: [{} as Card],
    objectiveCards: [],
    treasurePosition: 0,
    goldList: [],
    revealedCards: []
  };

  const mockRound2: Round = {
    index: 2,
    board: {
      grid: [],
      startCard: {} as Card,
      objectivePositions: []
    },
    users: [mockUser1, mockUser2],
    deck: [{} as Card],
    objectiveCards: [],
    treasurePosition: 0,
    goldList: [],
    revealedCards: []
  };

  beforeEach(async () => {
    // Create mocks
    loggerMock = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn()
    };

    roomRepositoryMock = {
      getRound: jest.fn(),
      // Mock other required methods
      getRoom: jest.fn(),
      getRoomUsers: jest.fn(),
      getSocketId: jest.fn(),
      isHost: jest.fn(),
      gameIsStarted: jest.fn(),
      setRound: jest.fn(),
      doesRoomExists: jest.fn(),
      getBoard: jest.fn(),
      getDeck: jest.fn(),
      getUserGame: jest.fn(),
      setRoom: jest.fn(),
      getCurrentRoundUser: jest.fn(),
    };

    // Initialize use case directly
    getRoundUseCases = new GetRoundUseCases(
      loggerMock,
      roomRepositoryMock
    );
  });

  describe('execute', () => {
    it('should get current round when no round number is provided', async () => {
      // Setup mock to return the first round
      roomRepositoryMock.getRound = jest.fn().mockResolvedValue(mockRound1);
      
      // Execute the use case without a round number
      const result = await getRoundUseCases.execute(mockCode);
      
      // Check the result
      expect(result).toEqual(mockRound1);
      // Verify repository was called with correct parameters
      expect(roomRepositoryMock.getRound).toHaveBeenCalledWith(mockCode, undefined);
    });

    it('should get specific round when round number is provided', async () => {
      // Setup mock to return the second round
      roomRepositoryMock.getRound = jest.fn().mockResolvedValue(mockRound2);
      
      // Execute the use case with round number 2
      const result = await getRoundUseCases.execute(mockCode, 2);
      
      // Check the result
      expect(result).toEqual(mockRound2);
      // Verify repository was called with correct parameters
      expect(roomRepositoryMock.getRound).toHaveBeenCalledWith(mockCode, 2);
    });

    it('should pass through any errors from the repository', async () => {
      // Setup mock to throw an error
      const errorMessage = 'Round not found';
      roomRepositoryMock.getRound = jest.fn().mockRejectedValue(new Error(errorMessage));
      
      // Execute and expect error
      await expect(getRoundUseCases.execute(mockCode, 3))
        .rejects.toThrow(errorMessage);
      
      // Verify repository was called with correct parameters
      expect(roomRepositoryMock.getRound).toHaveBeenCalledWith(mockCode, 3);
    });

    it('should handle empty or null response from repository', async () => {
      // Setup mock to return null
      roomRepositoryMock.getRound = jest.fn().mockResolvedValue(null);
      
      // Execute the use case
      const result = await getRoundUseCases.execute(mockCode);
      
      // Check that the result is null
      expect(result).toBeNull();
      // Verify repository was called
      expect(roomRepositoryMock.getRound).toHaveBeenCalledWith(mockCode, undefined);
    });
  });
});
