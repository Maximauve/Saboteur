import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { Card, CardType } from '@/domain/model/card';
import { Move, PlacedMove } from '@/domain/model/move';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { TranslationService } from '@/infrastructure/services/translation/translation.service';
import { DestroyCardUseCases } from '@/usecases/game/destroyCard.usecases';

describe('DestroyCardUseCases', () => {
  let destroyCardUseCases: DestroyCardUseCases;
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

  const move: Move = {
    x: 0,
    y: 0,
    card: new Card
  };

  const round: any = {
    index: 1,
    board: {
      grid: [[pathCard, null], [null, null]],
      startCard: {} as Card,
      objectivePositions: []
    },
    users: [],
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

    destroyCardUseCases = new DestroyCardUseCases(
      loggerMock,
      roomRepositoryMock,
      translationServiceMock
    );
  });

  describe('execute', () => {
    it('should destroy the card', async () => {
      await destroyCardUseCases.execute(mockCode, move);

      expect(roomRepositoryMock.setRound).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.getRound).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the card is not found on the board', async () => {
      const moveOnEmptySpace: Move = {
        x: 1,
        y: 1,
        card: new Card
      };

      await expect(destroyCardUseCases.execute(mockCode, moveOnEmptySpace)).rejects.toThrowError(
        'error.CARD_CANNOT_BE_PLACED'
      );

      expect(translationServiceMock.translate).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.getRound).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the card is a start or an end card', async () => {
      const startCard: Card = {
        id: 'start',
        tools: [],
        type: CardType.START,
        connections: [],
        imageUrl: ''
      };

      round.board.grid[0][0] = startCard;

      await expect(destroyCardUseCases.execute(mockCode, move)).rejects.toThrowError(
        'error.CARD_CANNOT_BE_PLACED'
      );

      expect(translationServiceMock.translate).toHaveBeenCalledTimes(1);
      expect(roomRepositoryMock.getRound).toHaveBeenCalledTimes(1);
    });
  });
});
