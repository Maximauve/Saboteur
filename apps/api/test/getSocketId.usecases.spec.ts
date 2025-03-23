import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { GetSocketIdUseCases } from '@/usecases/room/getSocketId.usecases';

describe('GetSocketIdUseCases', () => {
  let getSocketIdUseCases: GetSocketIdUseCases;
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

    getSocketIdUseCases = new GetSocketIdUseCases(
      loggerMock,
      roomRepositoryMock
    );
  });

  describe('execute', () => {
    it('should get the socket id of a user in a room', async () => {
      const mockCode = '12345';
      const mockUserId = '12345';
      const mockSocketId = 'socketId';

      (roomRepositoryMock.getSocketId as jest.Mock).mockResolvedValue(mockSocketId);

      const result = await getSocketIdUseCases.execute(mockCode, mockUserId);

      expect(result).toBe(mockSocketId);
      expect(roomRepositoryMock.getSocketId).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.getSocketId).toHaveBeenCalledWith(mockCode, mockUserId);
    });

    it('should return undefined if the user is not in the room', async () => {
      const mockCode = '12345';
      const mockUserId = '12345';

      (roomRepositoryMock.getSocketId as jest.Mock).mockResolvedValue(undefined);

      const result = await getSocketIdUseCases.execute(mockCode, mockUserId);

      expect(result).toBeUndefined();
      expect(roomRepositoryMock.getSocketId).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.getSocketId).toHaveBeenCalledWith(mockCode, mockUserId);
    });

    it('should handle errors from the room repository', async () => {
      const mockCode = '12345';
      const mockUserId = '12345';

      (roomRepositoryMock.getSocketId as jest.Mock).mockRejectedValue(new Error('Erreur lors de la récupération de l\'id de socket'));

      await expect(getSocketIdUseCases.execute(mockCode, mockUserId))
        .rejects
        .toThrowError('Erreur lors de la récupération de l\'id de socket');
    });

    it('should handle empty code', async () => {
      const mockCode = '';
      const mockUserId = '12345';

      (roomRepositoryMock.getSocketId as jest.Mock).mockResolvedValue(undefined);

      const result = await getSocketIdUseCases.execute(mockCode, mockUserId);

      expect(result).toBeUndefined();
      expect(roomRepositoryMock.getSocketId).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.getSocketId).toHaveBeenCalledWith(mockCode, mockUserId);
    });

    it('should handle empty user id', async () => {
      const mockCode = '12345';
      const mockUserId = '';

      (roomRepositoryMock.getSocketId as jest.Mock).mockResolvedValue(undefined);

      const result = await getSocketIdUseCases.execute(mockCode, mockUserId);

      expect(result).toBeUndefined();
      expect(roomRepositoryMock.getSocketId).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.getSocketId).toHaveBeenCalledWith(mockCode, mockUserId);
    });
  });
});
