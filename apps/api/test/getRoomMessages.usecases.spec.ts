import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { Message } from '@/domain/model/websocket';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { GetRoomMessagesUseCases } from '@/usecases/room/getRoomMessages.usecases';

describe('GetRoomMessagesUseCases', () => {
  let getRoomMessagesUseCases: GetRoomMessagesUseCases;
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

    getRoomMessagesUseCases = new GetRoomMessagesUseCases(
      loggerMock,
      roomRepositoryMock
    );
  });

  describe('execute', () => {
    it('should return the messages of the room', async () => {
      const mockRoomCode = 'ABC123';
      const mockMessages: Message[] = [
        { text: "oui", timeSent: new Date().toString() }
      ];

      const mockRoom = {
        messages: mockMessages
      };

      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(mockRoom);

      const result = await getRoomMessagesUseCases.execute(mockRoomCode);

      expect(result).toEqual(mockMessages);
      expect(roomRepositoryMock.getRoom).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.getRoom).toHaveBeenCalledWith(mockRoomCode);
    });

    it('should handle errors from the room repository', async () => {
      const mockRoomCode = 'ABC123';

      (roomRepositoryMock.getRoom as jest.Mock).mockRejectedValue(new Error('Erreur lors de la récupération des messages'));

      await expect(getRoomMessagesUseCases.execute(mockRoomCode))
        .rejects
        .toThrowError('Erreur lors de la récupération des messages');
    });

    it('should handle empty room messages', async () => {
      const mockRoomCode = 'ABC123';

      const mockRoom = {
        messages: []
      };

      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(mockRoom);

      const result = await getRoomMessagesUseCases.execute(mockRoomCode);

      expect(result).toEqual([]);
      expect(roomRepositoryMock.getRoom).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.getRoom).toHaveBeenCalledWith(mockRoomCode);
    });

    it('should handle null room messages', async () => {
      const mockRoomCode = 'ABC123';

      const mockRoom = {
        messages: undefined
      };

      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(mockRoom);

      const result = await getRoomMessagesUseCases.execute(mockRoomCode);

      expect(result).toBeUndefined();
      expect(roomRepositoryMock.getRoom).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.getRoom).toHaveBeenCalledWith(mockRoomCode);
    });
  });
});
