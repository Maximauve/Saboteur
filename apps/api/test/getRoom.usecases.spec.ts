import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { Room } from '@/domain/model/room';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { GetRoomUseCases } from '@/usecases/room/getRoom.usecases';
import { UserRoom } from '@/domain/model/user';

describe('GetRoomUseCases', () => {
  let getRoomUseCases: GetRoomUseCases;
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

    getRoomUseCases = new GetRoomUseCases(
      loggerMock,
      roomRepositoryMock
    );
  });

  describe('execute', () => {
    it('should get a room', async () => {
      const mockCode = '12345';
      const mockRoom: Room = {
        code: '12345',
        host: new UserRoom,
        users: [],
        started: false,
        currentRound: 0,
        goldDeck: [],
        messages: []
      };

      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(mockRoom);

      const result = await getRoomUseCases.execute(mockCode);

      expect(result).toEqual(mockRoom);
      expect(roomRepositoryMock.getRoom).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.getRoom).toHaveBeenCalledWith(mockCode);
    });

    it('should handle errors from the room repository', async () => {
      const mockCode = '12345';

      (roomRepositoryMock.getRoom as jest.Mock).mockRejectedValue(new Error('Erreur lors de la récupération de la salle'));

      await expect(getRoomUseCases.execute(mockCode))
        .rejects
        .toThrowError('Erreur lors de la récupération de la salle');
    });
  });
});
