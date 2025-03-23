import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { UserSocket } from '@/domain/model/user';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { RemoveUserFromRoomUseCases } from '@/usecases/room/removeUserFromRoom.usecases';

describe('RemoveUserFromRoomUseCases', () => {
  let removeUserFromRoomUseCases: RemoveUserFromRoomUseCases;
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
      getRoom: jest.fn(),
      setRoom: jest.fn(),
      doesRoomExists: jest.fn(),
      gameIsStarted: jest.fn(),
      getBoard: jest.fn(),
      getCurrentRoundUser: jest.fn(),
      getRoomUsers: jest.fn(),
      getDeck: jest.fn(),
      getRound: jest.fn(),
      getSocketId: jest.fn(),
      getUserGame: jest.fn(),
      isHost: jest.fn(),
      setRound: jest.fn()
    };

    removeUserFromRoomUseCases = new RemoveUserFromRoomUseCases(
      loggerMock,
      roomRepositoryMock
    );
  });

  describe('execute', () => {
    it('should not remove the user if the room has started', async () => {
      const mockRoomCode = 'ABC123';
      const mockUser: UserSocket = {
        userId: 'user-1',
        socketId: 'socket-1',
        ready: false,
        gold: 0,
        username: '',
        isHost: false
      };

      const mockRoom = {
        started: true,
        users: [
          mockUser,
          { userId: 'user-2', socketId: 'socket-2' }
        ]
      };

      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(mockRoom);

      await removeUserFromRoomUseCases.execute(mockRoomCode, mockUser);

      expect(roomRepositoryMock.setRoom).not.toHaveBeenCalled();
    });

    it('should remove the user from the room', async () => {
      const mockRoomCode = 'ABC123';
      const mockUser: UserSocket = {
        userId: 'user-1',
        socketId: 'socket-1',
        ready: false,
        gold: 0,
        username: '',
        isHost: false
      };

      const mockRoom = {
        started: false,
        users: [
          mockUser,
          { userId: 'user-2', socketId: 'socket-2' }
        ]
      };

      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(mockRoom);

      await removeUserFromRoomUseCases.execute(mockRoomCode, mockUser);

      expect(roomRepositoryMock.setRoom).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.setRoom).toHaveBeenCalledWith(mockRoomCode, [
        'users', JSON.stringify([
          { userId: 'user-2', socketId: 'socket-2' }
        ])
      ]);
    });

    it('should handle errors from the room repository', async () => {
      const mockRoomCode = 'ABC123';
      const mockUser: UserSocket = {
        userId: 'user-1',
        socketId: 'socket-1',
        ready: false,
        gold: 0,
        username: '',
        isHost: false
      };

      (roomRepositoryMock.getRoom as jest.Mock).mockRejectedValue(new Error('Erreur lors de la récupération de la salle'));

      await expect(removeUserFromRoomUseCases.execute(mockRoomCode, mockUser))
        .rejects
        .toThrowError('Erreur lors de la récupération de la salle');
    });
  });
});
