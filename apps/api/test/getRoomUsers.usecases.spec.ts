import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { UserSocket } from '@/domain/model/user';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { GetRoomUsersUseCases } from '@/usecases/room/getRoomUsers.usecases';

describe('GetRoomUsersUseCases', () => {
  let getRoomUsersUseCases: GetRoomUsersUseCases;
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
      setRoom: jest.fn(),
      setRound: jest.fn(),
      doesRoomExists: jest.fn(),
      gameIsStarted: jest.fn(),
      getBoard: jest.fn(),
      getCurrentRoundUser: jest.fn(),
      getDeck: jest.fn(),
      getRoom: jest.fn(),
      getRoomUsers: jest.fn(),
      getRound: jest.fn(),
      getSocketId: jest.fn(),
      getUserGame: jest.fn(),
      isHost: jest.fn(),
    };

    getRoomUsersUseCases = new GetRoomUsersUseCases(
      loggerMock,
      roomRepositoryMock
    );
  });

  describe('execute', () => {
    it('should get the users of a room', async () => {
      const mockCode = '12345';
      const mockUsers: UserSocket[] = [
        {
          socketId: 'socketId1',
          username: 'test1',
          ready: false,
          gold: 0,
          userId: '',
          isHost: false
        },
        {
          socketId: 'socketId2',
          username: 'test2',
          ready: false,
          gold: 0,
          userId: '',
          isHost: false
        }
      ];

      (roomRepositoryMock.getRoomUsers as jest.Mock).mockResolvedValue(mockUsers);

      const result = await getRoomUsersUseCases.execute(mockCode);

      expect(result).toEqual(mockUsers);
      expect(roomRepositoryMock.getRoomUsers).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.getRoomUsers).toHaveBeenCalledWith(mockCode);
    });

    it('should return an empty array if the room is empty', async () => {
      const mockCode = '12345';
      const mockUsers: UserSocket[] = [];

      (roomRepositoryMock.getRoomUsers as jest.Mock).mockResolvedValue(mockUsers);

      const result = await getRoomUsersUseCases.execute(mockCode);

      expect(result).toEqual(mockUsers);
      expect(roomRepositoryMock.getRoomUsers).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.getRoomUsers).toHaveBeenCalledWith(mockCode);
    });

    it('should handle errors from the room repository', async () => {
      const mockCode = '12345';

      (roomRepositoryMock.getRoomUsers as jest.Mock).mockRejectedValue(new Error('Erreur lors de la récupération des utilisateurs de la salle'));

      await expect(getRoomUsersUseCases.execute(mockCode))
        .rejects
        .toThrowError('Erreur lors de la récupération des utilisateurs de la salle');
    });

    it('should handle empty code', async () => {
      const mockCode = '';

      (roomRepositoryMock.getRoomUsers as jest.Mock).mockResolvedValue([]);

      const result = await getRoomUsersUseCases.execute(mockCode);

      expect(result).toEqual([]);
      expect(roomRepositoryMock.getRoomUsers).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.getRoomUsers).toHaveBeenCalledWith(mockCode);
    });
  });
});
