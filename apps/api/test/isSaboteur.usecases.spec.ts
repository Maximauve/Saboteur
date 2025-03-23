import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { Round } from '@/domain/model/round';
import { Board } from '@/domain/model/board';
import { Card } from '@/domain/model/card';
import { UserGame } from '@/domain/model/user';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { IsSaboteurWinUseCases } from '@/usecases/game/isSaboteurWin.usecases';

describe('IsSaboteurWinUseCases', () => {
  let isSaboteurWinUseCases: IsSaboteurWinUseCases;
  let loggerMock: ILogger;
  let roomRepositoryMock: RoomRepository;

  const mockCode = 'TEST123';

  const userWithCards: UserGame = {
    username: 'User 1',
    cards: [{ id: 'card1' } as Card],
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

  const userWithoutCards: UserGame = {
    username: 'User 2',
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

  const saboteurWithoutCards: UserGame = {
    username: 'Saboteur',
    cards: [],
    isSaboteur: true,
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

  const mockBoard: Board = {
    grid: [],
    startCard: {} as Card,
    objectivePositions: []
  };

  const mockRoundWithCards: Round = {
    index: 1,
    board: mockBoard,
    users: [userWithCards, userWithoutCards, saboteurWithoutCards],
    deck: [],
    objectiveCards: [],
    treasurePosition: 0,
    goldList: [],
    revealedCards: []
  };

  const mockRoundWithoutCards: Round = {
    index: 1,
    board: mockBoard,
    users: [
      { ...userWithCards, cards: [] },
      userWithoutCards,
      saboteurWithoutCards
    ],
    deck: [],
    objectiveCards: [],
    treasurePosition: 0,
    goldList: [],
    revealedCards: []
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
      getBoard: jest.fn(),
      getDeck: jest.fn(),
      getUserGame: jest.fn(),
      setRoom: jest.fn(),
      setRound: jest.fn(),
      getCurrentRoundUser: jest.fn()
    };

    isSaboteurWinUseCases = new IsSaboteurWinUseCases(
      loggerMock,
      roomRepositoryMock
    );
  });

  describe('execute', () => {
    it('should return false when at least one user has cards', async () => {
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRoundWithCards);
      
      const result = await isSaboteurWinUseCases.execute(mockCode);
      
      expect(roomRepositoryMock.getRound).toHaveBeenCalledWith(mockCode);
      expect(result).toBe(false);
    });

    it('should return true when no users have cards', async () => {
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRoundWithoutCards);
      
      const result = await isSaboteurWinUseCases.execute(mockCode);
      
      expect(roomRepositoryMock.getRound).toHaveBeenCalledWith(mockCode);
      expect(result).toBe(true);
    });

    it('should handle an empty users array', async () => {
      const emptyUsersRound: Round = {
        ...mockRoundWithCards,
        users: []
      };
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(emptyUsersRound);
      
      const result = await isSaboteurWinUseCases.execute(mockCode);
      
      expect(result).toBe(true);
    });

    it('should return true when all users have empty card arrays', async () => {
      const allEmptyCardsRound: Round = {
        ...mockRoundWithCards,
        users: [
          { ...userWithCards, cards: [] },
          userWithoutCards,
          saboteurWithoutCards
        ]
      };
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(allEmptyCardsRound);
      
      const result = await isSaboteurWinUseCases.execute(mockCode);
      
      expect(result).toBe(true);
    });

    it('should return false when at least one user has a non-empty card array', async () => {
      const oneUserWithCardsRound: Round = {
        ...mockRoundWithCards,
        users: [
          { ...userWithCards, cards: [{ id: 'card1' } as Card] },
          userWithoutCards,
          saboteurWithoutCards
        ]
      };
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(oneUserWithCardsRound);
      
      const result = await isSaboteurWinUseCases.execute(mockCode);
      
      expect(result).toBe(false);
    });

    it('should return false if the saboteur has cards', async () => {
      const saboteurWithCardsRound: Round = {
        ...mockRoundWithCards,
        users: [
          { ...userWithCards, cards: [] },
          userWithoutCards,
          { ...saboteurWithoutCards, cards: [{ id: 'card1' } as Card] }
        ]
      };
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(saboteurWithCardsRound);
      
      const result = await isSaboteurWinUseCases.execute(mockCode);
      
      expect(result).toBe(false);
    });

    it('should handle errors from the repository', async () => {
      const mockError = new Error('Repository error');
      (roomRepositoryMock.getRound as jest.Mock).mockRejectedValue(mockError);
      
      await expect(isSaboteurWinUseCases.execute(mockCode)).rejects.toThrow(mockError);
    });

    it('should pass different room codes to the repository correctly', async () => {
      const customCode = 'CUSTOM456';
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRoundWithoutCards);
      
      await isSaboteurWinUseCases.execute(customCode);
      
      expect(roomRepositoryMock.getRound).toHaveBeenCalledWith(customCode);
    });
  });
});
