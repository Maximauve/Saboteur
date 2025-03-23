import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { UserGame } from '@/domain/model/user';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { GetUserGameUseCases } from '@/usecases/game/getUserGame.usecases';

describe('GetUserGameUseCases', () => {
  let getUserGameUseCases: GetUserGameUseCases;
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

    getUserGameUseCases = new GetUserGameUseCases(
      loggerMock,
      roomRepositoryMock
    );
  });

  describe('execute', () => {
    it('should get the user game', async () => {
      const mockCode = '12345';
      const mockUserId = '12345';
      const mockUserGame: UserGame = {
        username: 'test',
        cards: [],
        isSaboteur: false,
        cardsRevealed: [],
        malus: [],
        hasToPlay: false,
        hasToChooseGold: false,
        socketId: '',
        ready: false,
        gold: 0,
        userId: '',
        isHost: false
      };

      (roomRepositoryMock.getUserGame as jest.Mock).mockResolvedValue(mockUserGame);

      const result = await getUserGameUseCases.execute(mockCode, mockUserId);

      expect(result).toEqual(mockUserGame);
      expect(roomRepositoryMock.getUserGame).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.getUserGame).toHaveBeenCalledWith(mockCode, mockUserId);
    });

    it('should throw an error if the room repository throws an error', async () => {
      const mockCode = '12345';
      const mockUserId = '12345';

      (roomRepositoryMock.getUserGame as jest.Mock).mockRejectedValue(new Error('Erreur lors de la récupération du jeu de l\'utilisateur'));

      await expect(getUserGameUseCases.execute(mockCode, mockUserId))
        .rejects
        .toThrowError('Erreur lors de la récupération du jeu de l\'utilisateur');
    });

    it('should handle empty code', async () => {
      const mockCode = '';
      const mockUserId = '12345';

      (roomRepositoryMock.getUserGame as jest.Mock).mockResolvedValue(null);

      const result = await getUserGameUseCases.execute(mockCode, mockUserId);

      expect(result).toBeNull();
      expect(roomRepositoryMock.getUserGame).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.getUserGame).toHaveBeenCalledWith(mockCode, mockUserId);
    });

    it('should handle empty user id', async () => {
      const mockCode = '12345';
      const mockUserId = '';

      (roomRepositoryMock.getUserGame as jest.Mock).mockResolvedValue(null);

      const result = await getUserGameUseCases.execute(mockCode, mockUserId);

      expect(result).toBeNull();
      expect(roomRepositoryMock.getUserGame).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.getUserGame).toHaveBeenCalledWith(mockCode, mockUserId);
    });
  });
});
