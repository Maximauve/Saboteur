import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { Card, CardType } from '@/domain/model/card';
import { Move } from '@/domain/model/move';
import { UserGame, UserSocket } from '@/domain/model/user';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { TranslationService } from '@/infrastructure/services/translation/translation.service';
import { DiscardCardUseCases } from '@/usecases/game/discardCard.usecases';

describe('DiscardCardUseCases', () => {
  let discardCardUseCases: DiscardCardUseCases;
  let loggerMock: ILogger;
  let roomRepositoryMock: RoomRepository;
  let translationServiceMock: TranslationService;

  const mockCode = 'TEST123';

  const card: Card = {
    id: 'card1',
    tools: [],
    type: CardType.PATH,
    connections: [],
    imageUrl: ''
  };

  const move: Move = {
    x: 0,
    y: 0,
    card: card
  };

  const userSocket: UserSocket = {
    userId: 'user1',
    username: 'User 1',
    socketId: 'socket1',
    ready: false,
    gold: 0,
    isHost: false
  };

  const userGame: UserGame = {
    userId: 'user1',
    username: 'User 1',
    socketId: 'socket1',
    gold: 0,
    cards: [card],
    malus: [],
    isHost: false,
    ready: true,
    isSaboteur: false,
    cardsRevealed: [],
    hasToPlay: true,
    hasToChooseGold: false
  };

  const round = {
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

  beforeEach(async () => {
    loggerMock = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn()
    };

    roomRepositoryMock = {
      getRound: jest.fn().mockResolvedValue(round),
      setRound: jest.fn(),
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
      getCurrentRoundUser: jest.fn()
    };

    translationServiceMock = {
      translate: jest.fn().mockImplementation(key => Promise.resolve(key))
    } as unknown as TranslationService;

    discardCardUseCases = new DiscardCardUseCases(
      loggerMock,
      roomRepositoryMock,
      translationServiceMock
    );
  });

  describe('execute', () => {
    it('should discard the card', async () => {
      await discardCardUseCases.execute(mockCode, userSocket, move);

      expect(roomRepositoryMock.setRound).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.getRound).toHaveBeenCalledTimes(1);
      expect(round.users[0].cards.length).toBe(0);
    });

    it('should throw an error if the user is not found', async () => {
      const userNotFound: UserSocket = {
        userId: 'user2',
        username: 'User 2',
        socketId: 'socket2',
        ready: false,
        gold: 0,
        isHost: false
      };

      await expect(discardCardUseCases.execute(mockCode, userNotFound, move)).rejects.toThrowError(
        'Cannot read properties of undefined (reading \'cards\')'
      );
    });
  });
});
