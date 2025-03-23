import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { Card, CardType, Tool } from '@/domain/model/card';
import { Move } from '@/domain/model/move';
import { UserGame, UserSocket } from '@/domain/model/user';
import { Round } from '@/domain/model/round';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { TranslationService } from '@/infrastructure/services/translation/translation.service';
import { CanUserPlayUseCases } from '@/usecases/game/canUserPlay.usecases';

describe('CanUserPlayUseCases', () => {
  let canUserPlayUseCases: CanUserPlayUseCases;
  let loggerMock: ILogger;
  let roomRepositoryMock: RoomRepository;
  let translationServiceMock: TranslationService;

  const mockCode = 'TEST123';

  const pathCard: Card = {
    id: 'card1',
    tools: [],
    type: CardType.PATH,
    connections: [],
    imageUrl: ''
  };

  const actionCard: Card = {
    id: 'card2',
    tools: [],
    type: CardType.REPAIR_TOOL,
    connections: [],
    imageUrl: ''
  };

  const brokenToolCard: Card = {
    id: 'brokenTool',
    tools: [Tool.LANTERN],
    type: CardType.BROKEN_TOOL,
    connections: [],
    imageUrl: ''
  };

  const userSocket: UserSocket = {
    userId: 'user1',
    username: 'User 1',
    socketId: '',
    ready: false,
    gold: 0,
    isHost: false
  };

  const userGame: UserGame = {
    userId: 'user1',
    username: 'User 1',
    socketId: 'socket1',
    gold: 0,
    cards: [pathCard, actionCard],
    malus: [],
    isHost: false,
    ready: true,
    isSaboteur: false,
    cardsRevealed: [],
    hasToPlay: true,
    hasToChooseGold: false
  };

  const userGameWithMalus: UserGame = {
    ...userGame,
    malus: [brokenToolCard]
  };

  const userGameNoTurn: UserGame = {
    ...userGame,
    hasToPlay: false
  };

  // Sample round data
  const mockRound: Round = {
    index: 1,
    board: {
      grid: [],
      startCard: {} as Card,
      objectivePositions: []
    },
    users: [userGame],
    deck: [{} as Card],
    objectiveCards: [],
    treasurePosition: 0,
    goldList: [],
    revealedCards: []
  };

  const mockRoundWithMalus: Round = {
    ...mockRound,
    users: [userGameWithMalus]
  };

  const mockRoundNoTurn: Round = {
    ...mockRound,
    users: [userGameNoTurn]
  };

  const mockRoundWithGold: Round = {
    ...mockRound,
    goldList: [1, 2, 3]
  };

  beforeEach(async () => {
    // Create mocks
    loggerMock = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn()
    };

    roomRepositoryMock = {
      getRound: jest.fn().mockResolvedValue(mockRound),
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

    canUserPlayUseCases = new CanUserPlayUseCases(
      loggerMock,
      roomRepositoryMock,
      translationServiceMock
    );
  });

  describe('execute', () => {
    it('should return true when user can play', async () => {
      const move: Move = {
        x: 0,
        y: 0,
        card: pathCard
      };

      const result = await canUserPlayUseCases.execute(mockCode, userSocket, move);

      expect(result.result).toBe(true);
      expect(result.error).toBe('');
      expect(roomRepositoryMock.getRound).toHaveBeenCalledWith(mockCode);
    });

    it('should return false when user is not found', async () => {
      const nonExistentUser: UserSocket = {
        userId: 'nonexistent',
        username: 'Nonexistent User',
        socketId: '',
        ready: false,
        gold: 0,
        isHost: false
      };

      const move: Move = {
        x: 0,
        y: 0,
        card: pathCard
      };

      const result = await canUserPlayUseCases.execute(mockCode, nonExistentUser, move);

      expect(result.result).toBe(false);
      expect(result.error).toBe('error.USER_NOT_FOUND');
      expect(translationServiceMock.translate).toHaveBeenCalledWith('error.USER_NOT_FOUND');
    });

    it('should return false when it is not user\'s turn', async () => {
      roomRepositoryMock.getRound = jest.fn().mockResolvedValue(mockRoundNoTurn);

      const move: Move = {
        x: 0,
        y: 0,
        card: pathCard
      };

      // Execute the use case
      const result = await canUserPlayUseCases.execute(mockCode, userSocket, move);

      // Verify result is false with correct error
      expect(result.result).toBe(false);
      expect(result.error).toBe('error.NOT_YOUR_TURN');
      expect(translationServiceMock.translate).toHaveBeenCalledWith('error.NOT_YOUR_TURN');
    });

    it('should return false during gold distribution time', async () => {
      roomRepositoryMock.getRound = jest.fn().mockResolvedValue(mockRoundWithGold);

      const move: Move = {
        x: 0,
        y: 0,
        card: pathCard
      };

      const result = await canUserPlayUseCases.execute(mockCode, userSocket, move);

      expect(result.result).toBe(false);
      expect(result.error).toBe('error.ITS_GOLD_TIME');
      expect(translationServiceMock.translate).toHaveBeenCalledWith('error.ITS_GOLD_TIME');
    });

    it('should return false when card is not provided', async () => {
      const move: Move = {
        x: 0,
        y: 0,
        card: {} as Card
      };

      const result = await canUserPlayUseCases.execute(mockCode, userSocket, move);

      expect(result.result).toBe(false);
      expect(result.error).toBe('error.CARD_NOT_IN_HAND');
      expect(translationServiceMock.translate).toHaveBeenCalledWith('error.CARD_NOT_IN_HAND');
    });

    it('should return false when card is not in user\'s hand', async () => {
      const nonExistentCard: Card = {
        id: 'nonexistent',
        tools: [],
        type: CardType.PATH,
        connections: [],
        imageUrl: ''
      };

      const move: Move = {
        x: 0,
        y: 0,
        card: nonExistentCard
      };

      const result = await canUserPlayUseCases.execute(mockCode, userSocket, move);

      expect(result.result).toBe(false);
      expect(result.error).toBe('error.CARD_NOT_IN_HAND');
      expect(translationServiceMock.translate).toHaveBeenCalledWith('error.CARD_NOT_IN_HAND');
    });

    it('should return false when user with malus tries to place a path card', async () => {
      roomRepositoryMock.getRound = jest.fn().mockResolvedValue(mockRoundWithMalus);

      const move: Move = {
        x: 0,
        y: 0,
        card: pathCard,
        discard: false
      };

      const result = await canUserPlayUseCases.execute(mockCode, userSocket, move);

      expect(result.result).toBe(false);
      expect(result.error).toBe('error.USER_CANT_PLACE_CARD');
      expect(translationServiceMock.translate).toHaveBeenCalledWith('error.USER_CANT_PLACE_CARD');
    });

    it('should return true when user with malus discards a card', async () => {
      roomRepositoryMock.getRound = jest.fn().mockResolvedValue(mockRoundWithMalus);

      const move: Move = {
        x: 0,
        y: 0,
        card: pathCard,
        discard: true
      };

      const result = await canUserPlayUseCases.execute(mockCode, userSocket, move);

      expect(result.result).toBe(true);
      expect(result.error).toBe('');
    });

    it('should return true when user with malus plays an action card', async () => {
      roomRepositoryMock.getRound = jest.fn().mockResolvedValue(mockRoundWithMalus);

      const move: Move = {
        x: 0,
        y: 0,
        card: actionCard,
        discard: false
      };

      const result = await canUserPlayUseCases.execute(mockCode, userSocket, move);

      expect(result.result).toBe(true);
      expect(result.error).toBe('');
    });
  });
});
