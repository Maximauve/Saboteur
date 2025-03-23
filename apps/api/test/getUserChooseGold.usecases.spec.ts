import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { Round } from '@/domain/model/round';
import { Board } from '@/domain/model/board';
import { Card } from '@/domain/model/card';
import { UserGame } from '@/domain/model/user';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { GetUserChooseGoldUseCases } from '@/usecases/game/getUserChooseGold.usecases';

describe('GetUserChooseGoldUseCases', () => {
  let getUserChooseGoldUseCases: GetUserChooseGoldUseCases;
  let loggerMock: ILogger;
  let roomRepositoryMock: RoomRepository;

  const mockCode = 'TEST123';

  // Sample user data
  const userWithGoldChoice: UserGame = {
    username: 'User 1',
    hasToChooseGold: true,
    cards: [],
    isSaboteur: false,
    cardsRevealed: [],
    malus: [],
    hasToPlay: false,
    socketId: '',
    ready: false,
    gold: 0,
    userId: '',
    isHost: false
  };

  const userWithoutGoldChoice: UserGame = {
    cards: [],
    isSaboteur: false,
    cardsRevealed: [],
    malus: [],
    hasToPlay: false,
    hasToChooseGold: false,
    socketId: '',
    ready: false,
    gold: 0,
    username: '',
    userId: '',
    isHost: false
  };

  const mockBoard: Board = {
    grid: [],
    startCard: {} as Card,
    objectivePositions: []
  };

  // Create a mock round with a user who has to choose gold
  const mockRoundWithGoldChoice: Round = {
    index: 1,
    board: mockBoard,
    users: [userWithGoldChoice, userWithoutGoldChoice],
    deck: [],
    objectiveCards: [],
    treasurePosition: 0,
    goldList: [3, 2, 1],
    revealedCards: []
  };

  // Create a mock round with no user who has to choose gold
  const mockRoundWithoutGoldChoice: Round = {
    ...mockRoundWithGoldChoice,
    users: [userWithoutGoldChoice]
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
      getRound: jest.fn().mockImplementation(() => Promise.resolve(mockRoundWithGoldChoice)),
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

    getUserChooseGoldUseCases = new GetUserChooseGoldUseCases(
      loggerMock,
      roomRepositoryMock
    );
  });

  describe('execute', () => {
    it('should return the user who has to choose gold', async () => {
      const result = await getUserChooseGoldUseCases.execute(mockCode);

      expect(result).toEqual(userWithGoldChoice);
      expect(roomRepositoryMock.getRound).toHaveBeenCalledWith(mockCode);
    });

    it('should return undefined if no user has to choose gold', async () => {
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRoundWithoutGoldChoice);

      const result = await getUserChooseGoldUseCases.execute(mockCode);

      expect(result).toBeUndefined();
      expect(roomRepositoryMock.getRound).toHaveBeenCalledWith(mockCode);
    });

    it('should return undefined for an empty users array', async () => {
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue({
        ...mockRoundWithGoldChoice,
        users: []
      });

      const result = await getUserChooseGoldUseCases.execute(mockCode);

      expect(result).toBeUndefined();
    });

    it('should pass through any errors from the repository', async () => {
      const mockError = new Error('Repository error');
      (roomRepositoryMock.getRound as jest.Mock).mockRejectedValue(mockError);

      await expect(getUserChooseGoldUseCases.execute(mockCode)).rejects.toThrow(mockError);
    });

    it('should find the user who needs to choose gold among multiple users', async () => {
      const additionalUser: UserGame = {
        username: 'User 3',
        cards: [],
        isSaboteur: false,
        cardsRevealed: [],
        malus: [],
        hasToPlay: false,
        hasToChooseGold: false,
        socketId: '',
        ready: false,
        gold: 0,
        userId: '',
        isHost: false
      };

      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue({
        ...mockRoundWithGoldChoice,
        users: [additionalUser, userWithoutGoldChoice, userWithGoldChoice]
      });

      const result = await getUserChooseGoldUseCases.execute(mockCode);

      expect(result).toEqual(userWithGoldChoice);
    });

    it('should work correctly when multiple users need to choose gold (returns the first one found)', async () => {
      const anotherUserWithGoldChoice: UserGame = {
        ...userWithoutGoldChoice,
        hasToChooseGold: true
      };

      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue({
        ...mockRoundWithGoldChoice,
        users: [anotherUserWithGoldChoice, userWithGoldChoice]
      });

      const result = await getUserChooseGoldUseCases.execute(mockCode);

      // Should return the first user with hasToChooseGold = true
      expect(result).toEqual(anotherUserWithGoldChoice);
    });

    it('should work with different room codes', async () => {
      const customCode = 'CUSTOM456';
      
      await getUserChooseGoldUseCases.execute(customCode);
      
      expect(roomRepositoryMock.getRound).toHaveBeenCalledWith(customCode);
    });
  });
});
