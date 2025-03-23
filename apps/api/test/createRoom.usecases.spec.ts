import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { UserFromRequest } from '@/domain/model/user';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { CreateRoomUseCases } from '@/usecases/room/createRoom.usecases';
import { UserRoom } from '@/domain/model/user';
import { Room } from '@/domain/model/room';

describe('CreateRoomUseCases', () => {
  let createRoomUseCases: CreateRoomUseCases;
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

    createRoomUseCases = new CreateRoomUseCases(
      loggerMock,
      roomRepositoryMock
    );
  });

  describe('execute', () => {
    it('should create a new room with a unique code', async () => {
      const mockUser: UserFromRequest = {
        username: 'username',
        id: 'id',
        email: ''
      };

      const mockHost: UserRoom = {
        username: mockUser.username,
        userId: mockUser.id,
        isHost: true
      };

      (roomRepositoryMock.doesRoomExists as jest.Mock).mockResolvedValue(false);

      const room = await createRoomUseCases.execute(mockUser);

      expect(room).toHaveProperty('code');
      expect(room).toHaveProperty('host', mockHost);
      expect(room).toHaveProperty('users', []);
      expect(room).toHaveProperty('started', false);
      expect(room).toHaveProperty('currentRound', 0);
      expect(room).toHaveProperty('goldDeck', []);

      expect(roomRepositoryMock.setRoom).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.setRound).toHaveBeenCalledTimes(1);
    });

    it('should generate a unique room code', async () => {
      const mockUser: UserFromRequest = {
        username: 'username',
        id: 'id',
        email: ''
      };

      (roomRepositoryMock.doesRoomExists as jest.Mock).mockResolvedValueOnce(true).mockResolvedValueOnce(false);

      const room = await createRoomUseCases.execute(mockUser);

      expect(roomRepositoryMock.doesRoomExists).toHaveBeenCalledTimes(2);
      expect(roomRepositoryMock.setRoom).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.setRound).toHaveBeenCalledTimes(1);
    });

    it('should call the room repository to set the room', async () => {
      const mockUser: UserFromRequest = {
        username: 'username',
        id: 'id',
        email: ''
      };

      (roomRepositoryMock.doesRoomExists as jest.Mock).mockResolvedValue(false);

      const room = await createRoomUseCases.execute(mockUser);

      expect(roomRepositoryMock.setRoom).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.setRound).toHaveBeenCalledTimes(1);
    });

    it('should call the room repository to set the round', async () => {
      const mockUser: UserFromRequest = {
        username: 'username',
        id: 'id',
        email: ''
      };

      (roomRepositoryMock.doesRoomExists as jest.Mock).mockResolvedValue(false);

      const room = await createRoomUseCases.execute(mockUser);

      expect(roomRepositoryMock.setRoom).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.setRound).toHaveBeenCalledTimes(1);
    });

    it('should handle errors from the room repository', async () => {
      const mockUser: UserFromRequest = {
        username: 'username',
        id: 'id',
        email: ''
      };

      (roomRepositoryMock.doesRoomExists as jest.Mock).mockRejectedValue(new Error('Erreur lors de la création de la salle'));

      await expect(createRoomUseCases.execute(mockUser))
        .rejects
        .toThrowError('Erreur lors de la création de la salle');
    });
  });

  describe('generateUniqueRoomCode', () => {
    it('should generate a unique room code', async () => {
      (roomRepositoryMock.doesRoomExists as jest.Mock).mockResolvedValue(false);

      const code = await createRoomUseCases.generateUniqueRoomCode();

      expect(code).toHaveLength(6);
      expect(roomRepositoryMock.doesRoomExists).toHaveBeenCalledTimes(1);
    });

    it('should generate a new code if the previous one is not unique', async () => {
      (roomRepositoryMock.doesRoomExists as jest.Mock).mockResolvedValueOnce(true).mockResolvedValueOnce(false);

      const code = await createRoomUseCases.generateUniqueRoomCode();

      expect(code).toHaveLength(6);
      expect(roomRepositoryMock.doesRoomExists).toHaveBeenCalledTimes(2);
    });

    it('should handle errors from the room repository', async () => {
      (roomRepositoryMock.doesRoomExists as jest.Mock).mockRejectedValue(new Error('Erreur lors de la génération du code'));

      await expect(createRoomUseCases.generateUniqueRoomCode())
        .rejects
        .toThrowError('Erreur lors de la génération du code');
    });
  });
});
