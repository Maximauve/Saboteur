import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { Card, CardType } from '@/domain/model/card';
import { UserGame, UserSocket } from '@/domain/model/user';
import { Round } from '@/domain/model/round';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { TranslationService } from '@/infrastructure/services/translation/translation.service';
import { DrawCardUseCases } from '@/usecases/game/drawCard.usecases';

describe('DrawCardUseCases', () => {
  let drawCardUseCases: DrawCardUseCases;
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
    cards: [pathCard],
    malus: [],
    isHost: false,
    ready: true,
    isSaboteur: false,
    cardsRevealed: [],
    hasToPlay: true,
    hasToChooseGold: false
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
    deck: [actionCard],
    objectiveCards: [],
    treasurePosition: 0,
    goldList: [],
    revealedCards: []
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

    drawCardUseCases = new DrawCardUseCases(
      loggerMock,
      roomRepositoryMock,
      translationServiceMock
    );
  });

  describe('execute', () => {
    it('should draw a card from the deck and add it to user cards', async () => {
      await drawCardUseCases.execute(mockCode, userSocket);

      const updatedUser = {...userGame, cards: [pathCard, actionCard]};
      const updatedRound = {...mockRound, users: [updatedUser], deck: []};

      expect(roomRepositoryMock.getRound).toHaveBeenCalledWith(mockCode);
      expect(roomRepositoryMock.setRound).toHaveBeenCalledWith(
        mockCode, 
        mockRound.index, 
        [
          'board', JSON.stringify(updatedRound.board),
          'users', JSON.stringify(updatedRound.users),
          'deck', JSON.stringify(updatedRound.deck)
        ]
      );
    });

    it('should not add card when deck is empty', async () => {
      const mockRoundEmptyDeck = {
        ...mockRound,
        deck: []
      };
      
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRoundEmptyDeck);

      await drawCardUseCases.execute(mockCode, userSocket);

      expect(roomRepositoryMock.setRound).toHaveBeenCalledWith(
        mockCode, 
        mockRoundEmptyDeck.index, 
        [
          'board', JSON.stringify(mockRoundEmptyDeck.board),
          'users', JSON.stringify(mockRoundEmptyDeck.users),
          'deck', JSON.stringify([])
        ]
      );
    });

    it('should find the user by userId in the round', async () => {
      const anotherUser: UserGame = {
        ...userGame,
        userId: 'user2',
        username: 'User 2'
      };
      
      const roundWithMultipleUsers: Round = {
        ...mockRound,
        users: [anotherUser, userGame]
      };
      
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(roundWithMultipleUsers);

      await drawCardUseCases.execute(mockCode, userSocket);

      const updatedFirstUser = anotherUser;
      const updatedSecondUser = {...userGame, cards: [pathCard, actionCard]};
      
      expect(roomRepositoryMock.setRound).toHaveBeenCalledWith(
        mockCode, 
        roundWithMultipleUsers.index, 
        [
          'board', JSON.stringify(roundWithMultipleUsers.board),
          'users', JSON.stringify([updatedFirstUser, updatedSecondUser]),
          'deck', JSON.stringify([])
        ]
      );
    });
  });
});
