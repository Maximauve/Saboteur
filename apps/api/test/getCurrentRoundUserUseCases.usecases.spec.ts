import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { UserGame } from '@/domain/model/user';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { GetCurrentRoundUserUseCases } from '@/usecases/room/getCurrentRoundUser.usecases';

describe('GetCurrentRoundUserUseCases', () => {
  let getCurrentRoundUserUseCases: GetCurrentRoundUserUseCases;
  let loggerMock: ILogger;
  let roomRepositoryMock: RoomRepository;

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

    getCurrentRoundUserUseCases = new GetCurrentRoundUserUseCases(
      loggerMock,
      roomRepositoryMock
    );
  });

  describe('execute', () => {
    it('should get the current round user', async () => {
      const mockCode = '12345';
      const mockUserId = '12345';
      const mockUserGame: UserGame = {
        username: 'test',
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

      (roomRepositoryMock.getCurrentRoundUser as jest.Mock).mockResolvedValue(mockUserGame);

      const result = await getCurrentRoundUserUseCases.execute(mockCode, mockUserId);

      expect(result).toEqual(mockUserGame);
      expect(roomRepositoryMock.getCurrentRoundUser).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.getCurrentRoundUser).toHaveBeenCalledWith(mockCode, mockUserId);
    });

    it('should return null if the user is not the current round user', async () => {
      const mockCode = '12345';
      const mockUserId = '12345';

      (roomRepositoryMock.getCurrentRoundUser as jest.Mock).mockResolvedValue(null);

      const result = await getCurrentRoundUserUseCases.execute(mockCode, mockUserId);

      expect(result).toBeNull();
      expect(roomRepositoryMock.getCurrentRoundUser).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.getCurrentRoundUser).toHaveBeenCalledWith(mockCode, mockUserId);
    });

    it('should handle errors from the room repository', async () => {
      const mockCode = '12345';
      const mockUserId = '12345';

      (roomRepositoryMock.getCurrentRoundUser as jest.Mock).mockRejectedValue(new Error('Erreur lors de la récupération de l\'utilisateur de la manche en cours'));

      await expect(getCurrentRoundUserUseCases.execute(mockCode, mockUserId))
        .rejects
        .toThrowError('Erreur lors de la récupération de l\'utilisateur de la manche en cours');
    });

    it('should handle empty code', async () => {
      const mockCode = '';
      const mockUserId = '12345';

      (roomRepositoryMock.getCurrentRoundUser as jest.Mock).mockResolvedValue(null);

      const result = await getCurrentRoundUserUseCases.execute(mockCode, mockUserId);

      expect(result).toBeNull();
      expect(roomRepositoryMock.getCurrentRoundUser).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.getCurrentRoundUser).toHaveBeenCalledWith(mockCode, mockUserId);
    });

    it('should handle empty user id', async () => {
      const mockCode = '12345';
      const mockUserId = '';

      (roomRepositoryMock.getCurrentRoundUser as jest.Mock).mockResolvedValue(null);

      const result = await getCurrentRoundUserUseCases.execute(mockCode, mockUserId);

      expect(result).toBeNull();
      expect(roomRepositoryMock.getCurrentRoundUser).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.getCurrentRoundUser).toHaveBeenCalledWith(mockCode, mockUserId);
    });
  });
});
