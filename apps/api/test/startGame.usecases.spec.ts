import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { GoldDeck } from '@/domain/model/gold-deck';
import { UserSocket } from '@/domain/model/user';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { TranslationService } from '@/infrastructure/services/translation/translation.service';
import { StartGameUseCases } from '@/usecases/game/startGame.usecases';

describe('StartGameUseCases', () => {
  let startGameUseCases: StartGameUseCases;
  let loggerMock: ILogger;
  let roomRepositoryMock: RoomRepository;
  let translationServiceMock: TranslationService;
  let originalMathRandom: () => number;
  
  const mockRoomCode = 'ABC123';

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

    originalMathRandom = Math.random;
    Math.random = jest.fn().mockReturnValue(0.5);

    startGameUseCases = new StartGameUseCases(
      loggerMock,
      roomRepositoryMock,
      translationServiceMock
    );
  });

  afterEach(() => {
    Math.random = originalMathRandom;
  });

  describe('execute', () => {
    it('should throw an error if the user is not the host', async () => {
      const mockUser: UserSocket = {
        userId: 'non-host-user',
        username: 'Non-Host User',
        socketId: '',
        ready: false,
        gold: 0,
        isHost: false
      };
      
      const mockRoom = {
        host: { userId: 'host-user' },
        started: false,
        users: [
          { userId: 'host-user' },
          { userId: 'non-host-user' },
          { userId: 'user3' }
        ]
      };
      
      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(mockRoom);
      
      await expect(startGameUseCases.execute(mockRoomCode, mockUser))
        .rejects
        .toThrow('error.NOT_HOST');
      
      expect(roomRepositoryMock.setRoom).not.toHaveBeenCalled();
    });

    it('should throw an error if the room is already started', async () => {
      const mockUser: UserSocket = {
        userId: 'host-user',
        username: 'Host User',
        socketId: '',
        ready: false,
        gold: 0,
        isHost: false
      };
      
      const mockRoom = {
        host: { userId: 'host-user' },
        started: true,
        users: [
          { userId: 'host-user' },
          { userId: 'user2' },
          { userId: 'user3' }
        ]
      };
      
      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(mockRoom);
      
      await expect(startGameUseCases.execute(mockRoomCode, mockUser))
        .rejects
        .toThrow('error.ROOM_ALREADY_STARTED');
      
      expect(roomRepositoryMock.setRoom).not.toHaveBeenCalled();
    });

    it('should throw an error if there are less than 3 users', async () => {
      const mockUser: UserSocket = {
        userId: 'host-user',
        username: 'Host User',
        socketId: '',
        ready: false,
        gold: 0,
        isHost: false
      };
      
      const mockRoom = {
        host: { userId: 'host-user' },
        started: false,
        users: [
          { userId: 'host-user' },
          { userId: 'user2' }
        ]
      };
      
      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(mockRoom);
      
      await expect(startGameUseCases.execute(mockRoomCode, mockUser))
        .rejects
        .toThrow('error.ROOM_MIN');
      
      expect(roomRepositoryMock.setRoom).not.toHaveBeenCalled();
    });

    it('should call the translation service with the right keys for errors', async () => {
      const mockUser: UserSocket = {
        userId: 'non-host-user',
        username: 'Non-Host User',
        socketId: '',
        ready: false,
        gold: 0,
        isHost: false
      };
      
      const mockRoom = {
        host: { userId: 'host-user' },
        started: false,
        users: [
          { userId: 'host-user' },
          { userId: 'non-host-user' },
          { userId: 'user3' }
        ]
      };
      
      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(mockRoom);
      
      await expect(startGameUseCases.execute(mockRoomCode, mockUser))
        .rejects
        .toThrow();
      
      expect(translationServiceMock.translate).toHaveBeenCalledWith('error.NOT_HOST');
      
      jest.clearAllMocks();
      
      const hostUser: UserSocket = {
        userId: 'host-user',
        username: 'Host User',
        socketId: '',
        ready: false,
        gold: 0,
        isHost: false
      };
      
      const startedRoom = {
        host: { userId: 'host-user' },
        started: true,
        users: [
          { userId: 'host-user' },
          { userId: 'user2' },
          { userId: 'user3' }
        ]
      };
      
      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(startedRoom);
      
      await expect(startGameUseCases.execute(mockRoomCode, hostUser))
        .rejects
        .toThrow();
      
      expect(translationServiceMock.translate).toHaveBeenCalledWith('error.ROOM_ALREADY_STARTED');
      
      jest.clearAllMocks();
      
      const notEnoughUsersRoom = {
        host: { userId: 'host-user' },
        started: false,
        users: [
          { userId: 'host-user' },
          { userId: 'user2' }
        ]
      };
      
      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(notEnoughUsersRoom);
      
      await expect(startGameUseCases.execute(mockRoomCode, hostUser))
        .rejects
        .toThrow();
      
      expect(translationServiceMock.translate).toHaveBeenCalledWith('error.ROOM_MIN');
    });

    it('should handle errors from the repository gracefully', async () => {
      const mockUser: UserSocket = {
        userId: 'host-user',
        username: 'Host User',
        socketId: '',
        ready: false,
        gold: 0,
        isHost: false
      };
      
      const mockError = new Error('Repository error');
      (roomRepositoryMock.getRoom as jest.Mock).mockRejectedValue(mockError);
      
      await expect(startGameUseCases.execute(mockRoomCode, mockUser))
        .rejects
        .toThrow(mockError);
      
      expect(roomRepositoryMock.setRoom).not.toHaveBeenCalled();
    });
  });

  describe('Private method: shuffleArray', () => {
    it('should shuffle an array while maintaining all elements', async () => {
      const mockUser: UserSocket = {
        userId: 'host-user',
        username: 'Host User',
        socketId: '',
        ready: false,
        gold: 0,
        isHost: false
      };
      
      const mockRoom = {
        host: { userId: 'host-user' },
        started: false,
        users: [
          { userId: 'host-user' },
          { userId: 'user2' },
          { userId: 'user3' }
        ]
      };
      
      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(mockRoom);
      
      const testGoldDeck = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const goldDeckSpy = jest.spyOn(GoldDeck.prototype, 'getDeck').mockReturnValue(testGoldDeck);
      
      let currentIndex = 0;
      const randomValues = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.0];
      Math.random = jest.fn(() => randomValues[currentIndex++ % randomValues.length]);
      
      await startGameUseCases.execute(mockRoomCode, mockUser);
      
      const setRoomCall = (roomRepositoryMock.setRoom as jest.Mock).mock.calls[0][1];
      const shuffledGoldDeckStr = setRoomCall[3];
      const shuffledGoldDeck = JSON.parse(shuffledGoldDeckStr);
      
      expect(shuffledGoldDeck.slice().sort((a: number, b: number) => a - b))
        .toEqual(testGoldDeck.slice().sort((a, b) => a - b));
      
      expect(shuffledGoldDeck).not.toEqual(testGoldDeck);
      
      expect(shuffledGoldDeck.length).toBe(testGoldDeck.length);
      
      goldDeckSpy.mockRestore();
    });

    it('should work with an empty array', async () => {
      const mockUser: UserSocket = {
        userId: 'host-user',
        username: 'Host User',
        socketId: '',
        ready: false,
        gold: 0,
        isHost: false
      };
      
      const mockRoom = {
        host: { userId: 'host-user' },
        started: false,
        users: [
          { userId: 'host-user' },
          { userId: 'user2' },
          { userId: 'user3' }
        ]
      };
      
      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(mockRoom);
      
      const emptyDeck: number[] = [];
      const goldDeckSpy = jest.spyOn(GoldDeck.prototype, 'getDeck').mockReturnValue(emptyDeck);
      
      await startGameUseCases.execute(mockRoomCode, mockUser);
      
      const setRoomCall = (roomRepositoryMock.setRoom as jest.Mock).mock.calls[0][1];
      const shuffledGoldDeckStr = setRoomCall[3];
      const shuffledGoldDeck = JSON.parse(shuffledGoldDeckStr);
      
      expect(shuffledGoldDeck).toEqual([]);
      
      goldDeckSpy.mockRestore();
    });

    it('should work with an array of size 1', async () => {
      const mockUser: UserSocket = {
        userId: 'host-user',
        username: 'Host User',
        socketId: '',
        ready: false,
        gold: 0,
        isHost: false
      };
      
      const mockRoom = {
        host: { userId: 'host-user' },
        started: false,
        users: [
          { userId: 'host-user' },
          { userId: 'user2' },
          { userId: 'user3' }
        ]
      };
      
      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(mockRoom);
      
      const singleElementDeck = [42];
      const goldDeckSpy = jest.spyOn(GoldDeck.prototype, 'getDeck').mockReturnValue(singleElementDeck);
      
      await startGameUseCases.execute(mockRoomCode, mockUser);
      
      const setRoomCall = (roomRepositoryMock.setRoom as jest.Mock).mock.calls[0][1];
      const shuffledGoldDeckStr = setRoomCall[3];
      const shuffledGoldDeck = JSON.parse(shuffledGoldDeckStr);
      
      expect(shuffledGoldDeck).toEqual([42]);
      
      goldDeckSpy.mockRestore();
    });

    it('should handle arrays with non-primitive types', async () => {

      const testArray = [
        { id: 1, value: 'one' },
        { id: 2, value: 'two' },
        { id: 3, value: 'three' }
      ];
      
      Math.random = jest.fn().mockReturnValue(0.5);
      
      const result = (startGameUseCases as any).shuffleArray(testArray);
      
      expect(result).not.toBe(testArray);
      
      const originalIds = testArray.map(item => item.id).sort();
      const resultIds = result.map((item: any) => item.id).sort();
      expect(resultIds).toEqual(originalIds);
      
      expect(result.map((item: any) => item)).toEqual(
        expect.arrayContaining(testArray)
      );
    });

    it('should not modify the original array', async () => {
      const testArray = [1, 2, 3, 4, 5];
      const originalArray = [...testArray];
      
      const result = (startGameUseCases as any).shuffleArray(testArray);
      
      expect(testArray).toEqual(originalArray);
      
      expect(result).not.toBe(testArray);
    });

    it('should produce different results with different random values', async () => {
      const testArray = [1, 2, 3, 4, 5];
      
      Math.random = jest.fn().mockReturnValue(0.1);
      const result1 = (startGameUseCases as any).shuffleArray(testArray);
      
      Math.random = jest.fn().mockReturnValue(0.9);
      const result2 = (startGameUseCases as any).shuffleArray(testArray);
      
      expect(result1).not.toEqual(result2);
    });

    it('should call Math.random the expected number of times', async () => {
      const testArray = [1, 2, 3, 4, 5];
      Math.random = jest.fn().mockReturnValue(0.5);
      
      (startGameUseCases as any).shuffleArray(testArray);
      
      expect(Math.random).toHaveBeenCalledTimes(testArray.length - 1);
    });
  });
});
