import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { UserSocket } from '@/domain/model/user';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { TranslationService } from '@/infrastructure/services/translation/translation.service';
import { AddUserToRoomUseCases } from '@/usecases/room/addUserToRoom.usecases';

describe('AddUserToRoomUseCases', () => {
  let addUserToRoomUseCases: AddUserToRoomUseCases;
  let loggerMock: ILogger;
  let roomRepositoryMock: RoomRepository;
  let translationServiceMock: TranslationService;

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

    addUserToRoomUseCases = new AddUserToRoomUseCases(
      loggerMock,
      roomRepositoryMock,
      translationServiceMock
    );
  });

  describe('execute', () => {
    it('should add a user to a room', async () => {
      const mockCode = '12345';
      const mockUser: UserSocket = {
        userId: '12345',
        username: 'test',
        socketId: 'socket-id',
        ready: false,
        gold: 0,
        isHost: false
      };

      const mockRoom = {
        id: '12345',
        code: '12345',
        host: {
          userId: '67890',
          username: 'host',
          socketId: 'host-socket-id'
        },
        users: [],
        started: false
      };

      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(mockRoom);

      await addUserToRoomUseCases.execute(mockCode, mockUser);

      expect(roomRepositoryMock.setRoom).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.setRoom).toHaveBeenCalledWith(mockCode, [
        'users', JSON.stringify([...mockRoom.users, mockUser]),
      ]);
    });

    it('should throw an error if the room is already started and the user is not in the room', async () => {
      const mockCode = '12345';
      const mockUser: UserSocket = {
        userId: '12345',
        username: 'test',
        socketId: 'socket-id',
        ready: false,
        gold: 0,
        isHost: false
      };

      const mockRoom = {
        id: '12345',
        code: '12345',
        host: {
          userId: '67890',
          username: 'host',
          socketId: 'host-socket-id'
        },
        users: [],
        started: true
      };

      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(mockRoom);
      (translationServiceMock.translate as jest.Mock).mockResolvedValue('La salle a déjà commencé');

      await expect(addUserToRoomUseCases.execute(mockCode, mockUser))
        .rejects
        .toThrowError('La salle a déjà commencé');
    });

    it('should throw an error if the room is full and the user is not in the room', async () => {
      const mockCode = '12345';
      const mockUser: UserSocket = {
        userId: '12345',
        username: 'test',
        socketId: 'socket-id',
        ready: false,
        gold: 0,
        isHost: false
      };

      const mockRoom = {
        id: '12345',
        code: '12345',
        host: {
          userId: '67890',
          username: 'host',
          socketId: 'host-socket-id'
        },
        users: new Array(10),
        started: false
      };

      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(mockRoom);
      (translationServiceMock.translate as jest.Mock).mockResolvedValue('La salle est pleine');

      await expect(addUserToRoomUseCases.execute(mockCode, mockUser))
        .rejects
        .toThrowError('La salle est pleine');
    });

    it('should update the host socket id if the user is the host', async () => {
      const mockCode = '12345';
      const mockUser: UserSocket = {
        userId: '67890',
        username: 'host',
        socketId: 'new-socket-id',
        ready: false,
        gold: 0,
        isHost: false
      };

      const mockRoom = {
        id: '12345',
        code: '12345',
        host: {
          userId: '67890',
          username: 'host',
          socketId: 'old-socket-id'
        },
        users: [],
        started: false
      };

      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(mockRoom);

      await addUserToRoomUseCases.execute(mockCode, mockUser);

      expect(roomRepositoryMock.setRoom).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.setRoom).toHaveBeenCalledWith(mockCode, [
        'hosts', JSON.stringify(mockUser),
        'users', JSON.stringify([mockUser]),
      ]);
    });

    it('should update the user socket id if the user is already in the room', async () => {
      const mockCode = '12345';
      const mockUser: UserSocket = {
        userId: '12345',
        username: 'test',
        socketId: 'new-socket-id',
        ready: false,
        gold: 0,
        isHost: false
      };

      const mockRoom = {
        id: '12345',
        code: '12345',
        host: {
          userId: '67890',
          username: 'host',
          socketId: 'host-socket-id'
        },
        users: [
          {
            userId: '12345',
            username: 'test',
            socketId: 'old-socket-id'
          }
        ],
        started: false
      };

      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(mockRoom);

      await addUserToRoomUseCases.execute(mockCode, mockUser);

      expect(roomRepositoryMock.setRoom).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.setRoom).toHaveBeenCalledWith(mockCode, [
        'users', JSON.stringify([
          {
            userId: '12345',
            username: 'test',
            socketId: 'new-socket-id'
          }
        ]),
      ]);
    });
  });
});
