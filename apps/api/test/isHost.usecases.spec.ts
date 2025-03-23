import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { UserSocket } from '@/domain/model/user';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { IsHostUseCases } from '@/usecases/room/isHost.usecases';

describe('IsHostUseCases', () => {
  let isHostUseCases: IsHostUseCases;
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

    isHostUseCases = new IsHostUseCases(
      loggerMock,
      roomRepositoryMock
    );
  });

  describe('execute', () => {
    it('should check if the user is the host of a room', async () => {
      const mockCode = '12345';
      const mockUser: UserSocket = {
        socketId: 'socketId',
        username: 'test',
        ready: false,
        gold: 0,
        userId: '',
        isHost: false
      };

      (roomRepositoryMock.isHost as jest.Mock).mockResolvedValue(true);

      const result = await isHostUseCases.execute(mockCode, mockUser);

      expect(result).toBe(true);
      expect(roomRepositoryMock.isHost).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.isHost).toHaveBeenCalledWith(mockCode, mockUser);
    });

    it('should return false if the user is not the host of a room', async () => {
      const mockCode = '12345';
      const mockUser: UserSocket = {
        socketId: 'socketId',
        username: 'test',
        ready: false,
        gold: 0,
        userId: '',
        isHost: false
      };

      (roomRepositoryMock.isHost as jest.Mock).mockResolvedValue(false);

      const result = await isHostUseCases.execute(mockCode, mockUser);

      expect(result).toBe(false);
      expect(roomRepositoryMock.isHost).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.isHost).toHaveBeenCalledWith(mockCode, mockUser);
    });

    it('should handle errors from the room repository', async () => {
      const mockCode = '12345';
      const mockUser: UserSocket = {
        socketId: 'socketId',
        username: 'test',
        ready: false,
        gold: 0,
        userId: '',
        isHost: false
      };

      (roomRepositoryMock.isHost as jest.Mock).mockRejectedValue(new Error('Erreur lors de la vérification de l\'hôte'));

      await expect(isHostUseCases.execute(mockCode, mockUser))
        .rejects
        .toThrowError('Erreur lors de la vérification de l\'hôte');
    });

    it('should handle empty code', async () => {
      const mockCode = '';
      const mockUser: UserSocket = {
        socketId: 'socketId',
        username: 'test',
        ready: false,
        gold: 0,
        userId: '',
        isHost: false
      };

      (roomRepositoryMock.isHost as jest.Mock).mockResolvedValue(false);

      const result = await isHostUseCases.execute(mockCode, mockUser);

      expect(result).toBe(false);
      expect(roomRepositoryMock.isHost).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.isHost).toHaveBeenCalledWith(mockCode, mockUser);
    });
  });
});
