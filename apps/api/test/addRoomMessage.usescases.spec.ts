import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { Message } from '@/domain/model/websocket';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { AddRoomMessageUseCases } from '@/usecases/room/addRoomMessage.usecases';

describe('AddRoomMessageUseCases', () => {
  let addRoomMessageUseCases: AddRoomMessageUseCases;
  let loggerMock: ILogger;
  let roomRepositoryMock: RoomRepository;
  
  const mockRoomCode = 'ABCDEF';

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

    addRoomMessageUseCases = new AddRoomMessageUseCases(
      loggerMock,
      roomRepositoryMock
    );
  });

  describe('execute', () => {
    it('should add a message to an empty message list', async () => {
      const mockRoom = {
        messages: [],
      };
      
      const mockMessage: Message = {
        text: 'Hello, world!',
        timeSent: ''
      };
      
      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(mockRoom);
      (roomRepositoryMock.setRoom as jest.Mock).mockResolvedValue(undefined);
      
      await addRoomMessageUseCases.execute(mockRoomCode, mockMessage);
      
      expect(roomRepositoryMock.getRoom).toHaveBeenCalledWith(mockRoomCode);
      expect(mockRoom.messages).toHaveLength(1);
      expect(mockRoom.messages[0]).toEqual(mockMessage);
      expect(roomRepositoryMock.setRoom).toHaveBeenCalledWith(
        mockRoomCode,
        ['messages', JSON.stringify([mockMessage])]
      );
    });

    it('should add a message to a non-empty message list', async () => {
      const existingMessage: Message = {
        text: 'I was here first!',
        timeSent: ''
      };
      
      const mockRoom = {
        messages: [existingMessage],
      };
      
      const newMessage: Message = {
        text: 'Hello, world!',
        timeSent: ''
      };
      
      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(mockRoom);
      (roomRepositoryMock.setRoom as jest.Mock).mockResolvedValue(undefined);
      
      await addRoomMessageUseCases.execute(mockRoomCode, newMessage);
      
      expect(roomRepositoryMock.getRoom).toHaveBeenCalledWith(mockRoomCode);
      expect(mockRoom.messages).toHaveLength(2);
      expect(mockRoom.messages[0]).toEqual(existingMessage);
      expect(mockRoom.messages[1]).toEqual(newMessage);
      expect(roomRepositoryMock.setRoom).toHaveBeenCalledWith(
        mockRoomCode,
        ['messages', JSON.stringify([existingMessage, newMessage])]
      );
    });

    it('should handle messages with various properties correctly', async () => {
      const mockRoom = {
        messages: [],
      };
      
      const complexMessage: Message = {
        text: 'This is a message with special characters: !@#$%^&*()',
        timeSent: '',
      };
      
      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(mockRoom);
      (roomRepositoryMock.setRoom as jest.Mock).mockResolvedValue(undefined);
      
      await addRoomMessageUseCases.execute(mockRoomCode, complexMessage);
      
      expect(mockRoom.messages).toHaveLength(1);
      expect(mockRoom.messages[0]).toEqual(complexMessage);
      expect(roomRepositoryMock.setRoom).toHaveBeenCalledWith(
        mockRoomCode,
        ['messages', expect.any(String)]
      );
      
      const setRoomCall = (roomRepositoryMock.setRoom as jest.Mock).mock.calls[0];
      const serializedMessages = setRoomCall[1][1];
      const parsedMessages = JSON.parse(serializedMessages);
      expect(parsedMessages).toEqual([complexMessage]);
    });

    it('should handle errors from roomRepository.getRoom', async () => {
      const mockError = new Error('Room not found');
      (roomRepositoryMock.getRoom as jest.Mock).mockRejectedValue(mockError);
      
      const mockMessage: Message = {
        text: 'Hello, world!',
        timeSent: ''
      };
      
      await expect(addRoomMessageUseCases.execute(mockRoomCode, mockMessage))
        .rejects
        .toThrow(mockError);
      
      expect(roomRepositoryMock.getRoom).toHaveBeenCalledWith(mockRoomCode);
      expect(roomRepositoryMock.setRoom).not.toHaveBeenCalled();
    });

    it('should handle errors from roomRepository.setRoom', async () => {
      const mockRoom = {
        messages: [],
      };
      
      const mockMessage: Message = {
        text: 'Hello, world!',
        timeSent: ''
      };
      
      const mockError = new Error('Failed to save room');
      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(mockRoom);
      (roomRepositoryMock.setRoom as jest.Mock).mockRejectedValue(mockError);
      
      await expect(addRoomMessageUseCases.execute(mockRoomCode, mockMessage))
        .rejects
        .toThrow(mockError);
      
      expect(roomRepositoryMock.getRoom).toHaveBeenCalledWith(mockRoomCode);
      expect(roomRepositoryMock.setRoom).toHaveBeenCalledWith(
        mockRoomCode,
        ['messages', JSON.stringify([mockMessage])]
      );
    });

    it('should handle a room with undefined messages property', async () => {
      const mockRoom = {
        messages: []
      };
      
      const mockMessage: Message = {
        text: 'Hello, world!',
        timeSent: ''
      };
      
      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(mockRoom);
      (roomRepositoryMock.setRoom as jest.Mock).mockResolvedValue(undefined);
      
      await addRoomMessageUseCases.execute(mockRoomCode, mockMessage);

      expect(mockRoom.messages).toEqual([mockMessage]);
      expect(roomRepositoryMock.setRoom).toHaveBeenCalledWith(
        mockRoomCode,
        ['messages', JSON.stringify([mockMessage])]
      );
    });

    it('should handle a message with a very long text', async () => {
      const mockRoom = {
        messages: [],
      };
      
      const longText = 'a'.repeat(10000);
      const longMessage: Message = {
        text: longText,
        timeSent: ''
      };
      
      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(mockRoom);
      (roomRepositoryMock.setRoom as jest.Mock).mockResolvedValue(undefined);
      
      await addRoomMessageUseCases.execute(mockRoomCode, longMessage);
      
      expect(mockRoom.messages).toEqual([longMessage]);
      expect(roomRepositoryMock.setRoom).toHaveBeenCalledWith(
        mockRoomCode,
        ['messages', expect.stringContaining(longText)]
      );
    });

    it('should not modify the original message', async () => {
      const mockRoom = {
        messages: [],
      };
      
      const originalMessage: Message = {
        text: 'Original message',
        timeSent: ''
      };
      
      const messageCopy = JSON.parse(JSON.stringify(originalMessage));
      
      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(mockRoom);
      (roomRepositoryMock.setRoom as jest.Mock).mockResolvedValue(undefined);
      
      await addRoomMessageUseCases.execute(mockRoomCode, originalMessage);
      
      expect(originalMessage).toEqual(messageCopy);
    });

    it('should work with an empty text message', async () => {
      const mockRoom = {
        messages: [],
      };
      
      const emptyMessage: Message = {
        text: '',
        timeSent: ''
      };
      
      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(mockRoom);
      (roomRepositoryMock.setRoom as jest.Mock).mockResolvedValue(undefined);
      
      await addRoomMessageUseCases.execute(mockRoomCode, emptyMessage);
      
      expect(mockRoom.messages).toEqual([emptyMessage]);
      expect(roomRepositoryMock.setRoom).toHaveBeenCalledWith(
        mockRoomCode,
        ['messages', JSON.stringify([emptyMessage])]
      );
    });
  });
});
