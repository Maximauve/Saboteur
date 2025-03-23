import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { GameIsStartedUseCases } from '@/usecases/room/gameIsStarted.usecases';

describe('GameIsStartedUseCases', () => {
  let gameIsStartedUseCases: GameIsStartedUseCases;
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

    gameIsStartedUseCases = new GameIsStartedUseCases(
      loggerMock,
      roomRepositoryMock
    );
  });

  describe('execute', () => {
    it('should check if the game is started', async () => {
      const mockCode = '12345';

      (roomRepositoryMock.gameIsStarted as jest.Mock).mockResolvedValue(true);

      const result = await gameIsStartedUseCases.execute(mockCode);

      expect(result).toBe(true);
      expect(roomRepositoryMock.gameIsStarted).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.gameIsStarted).toHaveBeenCalledWith(mockCode);
    });

    it('should return false if the game is not started', async () => {
      const mockCode = '12345';

      (roomRepositoryMock.gameIsStarted as jest.Mock).mockResolvedValue(false);

      const result = await gameIsStartedUseCases.execute(mockCode);

      expect(result).toBe(false);
      expect(roomRepositoryMock.gameIsStarted).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.gameIsStarted).toHaveBeenCalledWith(mockCode);
    });

    it('should handle errors from the room repository', async () => {
      const mockCode = '12345';

      (roomRepositoryMock.gameIsStarted as jest.Mock).mockRejectedValue(new Error('Erreur lors de la vérification du statut du jeu'));

      await expect(gameIsStartedUseCases.execute(mockCode))
        .rejects
        .toThrowError('Erreur lors de la vérification du statut du jeu');
    });

    it('should handle empty code', async () => {
      const mockCode = '';

      (roomRepositoryMock.gameIsStarted as jest.Mock).mockResolvedValue(false);

      const result = await gameIsStartedUseCases.execute(mockCode);

      expect(result).toBe(false);
      expect(roomRepositoryMock.gameIsStarted).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.gameIsStarted).toHaveBeenCalledWith(mockCode);
    });
  });
});
