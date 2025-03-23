import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { Board } from '@/domain/model/board';
import { Card } from '@/domain/model/card';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { GetBoardUseCases } from '@/usecases/game/getBoard.usecases';

describe('GetBoardUseCases', () => {
  let getBoardUseCases: GetBoardUseCases;
  let loggerMock: ILogger;
  let roomRepositoryMock: RoomRepository;

  const mockCode = 'TEST123';

  const mockBoard: Board = {
    grid: [],
    startCard: {} as Card,
    objectivePositions: []
  };

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
      getBoard: jest.fn().mockResolvedValue(mockBoard),
      getDeck: jest.fn(),
      getUserGame: jest.fn(),
      setRoom: jest.fn(),
      setRound: jest.fn(),
      getCurrentRoundUser: jest.fn()
    };

    getBoardUseCases = new GetBoardUseCases(
      loggerMock,
      roomRepositoryMock
    );
  });

  describe('execute', () => {
    it('should return the board for the given room code', async () => {
      const result = await getBoardUseCases.execute(mockCode);

      expect(result).toBe(mockBoard);
      expect(roomRepositoryMock.getBoard).toHaveBeenCalledWith(mockCode);
    });

    it('should pass through any errors from the repository', async () => {
      const mockError = new Error('Repository error');
      (roomRepositoryMock.getBoard as jest.Mock).mockRejectedValue(mockError);

      await expect(getBoardUseCases.execute(mockCode)).rejects.toThrow(mockError);
    });

    it('should work with an empty board', async () => {
      const emptyBoard: Board = {
        grid: [],
        startCard: {} as Card,
        objectivePositions: []
      };
      
      (roomRepositoryMock.getBoard as jest.Mock).mockResolvedValue(emptyBoard);

      const result = await getBoardUseCases.execute(mockCode);

      expect(result).toEqual(emptyBoard);
      expect(roomRepositoryMock.getBoard).toHaveBeenCalledWith(mockCode);
    });

    it('should work with a populated board', async () => {
      const populatedBoard: Board = {
        grid: [
          [null, {} as Card, null],
          [{} as Card, {} as Card, {} as Card],
          [null, {} as Card, null]
        ],
        startCard: {} as Card,
        objectivePositions: [{
          x: 0, y: 0,
          id: '',
          type: 'COAL',
          connections: []
        }, {
          x: 1, y: 1,
          id: '',
          type: 'COAL',
          connections: []
        }]
      };
      
      (roomRepositoryMock.getBoard as jest.Mock).mockResolvedValue(populatedBoard);

      const result = await getBoardUseCases.execute(mockCode);

      expect(result).toEqual(populatedBoard);
      expect(roomRepositoryMock.getBoard).toHaveBeenCalledWith(mockCode);
    });
  });
});
