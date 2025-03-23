import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { Card, CardType } from '@/domain/model/card';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { GetDeckLengthUseCases } from '@/usecases/game/getDeckLength.usecases';

describe('GetDeckLengthUseCases', () => {
  let getDeckLengthUseCases: GetDeckLengthUseCases;
  let loggerMock: ILogger;
  let roomRepositoryMock: RoomRepository;

  const mockCode = 'TEST123';

  // Create some test cards
  const card1: Card = {
    id: 'card1',
    type: CardType.PATH,
    connections: [],
    tools: [],
    imageUrl: 'path.png'
  };

  const card2: Card = {
    id: 'card2',
    type: CardType.PATH,
    connections: [],
    tools: [],
    imageUrl: 'path.png'
  };

  const mockEmptyDeck: Card[] = [];
  const mockDeck: Card[] = [card1, card2];

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
      getRound: jest.fn(),
      getRoom: jest.fn(),
      getRoomUsers: jest.fn(),
      getSocketId: jest.fn(),
      isHost: jest.fn(),
      gameIsStarted: jest.fn(),
      doesRoomExists: jest.fn(),
      getBoard: jest.fn(),
      getDeck: jest.fn().mockResolvedValue(mockDeck) as jest.MockedFunction<(code: string) => Promise<Card[]>>,
      getUserGame: jest.fn(),
      setRoom: jest.fn(),
      setRound: jest.fn(),
      getCurrentRoundUser: jest.fn()
    };

    getDeckLengthUseCases = new GetDeckLengthUseCases(
      loggerMock,
      roomRepositoryMock
    );
  });

  describe('execute', () => {
    it('should return the length of the deck', async () => {
      const result = await getDeckLengthUseCases.execute(mockCode);

      expect(result).toBe(2);
      expect(roomRepositoryMock.getDeck).toHaveBeenCalledWith(mockCode);
    });

    it('should return 0 for an empty deck', async () => {
      (roomRepositoryMock.getDeck as jest.Mock).mockResolvedValue(mockEmptyDeck);

      const result = await getDeckLengthUseCases.execute(mockCode);

      expect(result).toBe(0);
      expect(roomRepositoryMock.getDeck).toHaveBeenCalledWith(mockCode);
    });

    it('should handle larger decks', async () => {
      const largeDeck = Array(40).fill(card1);
      (roomRepositoryMock.getDeck as jest.Mock).mockResolvedValue(largeDeck);

      const result = await getDeckLengthUseCases.execute(mockCode);

      expect(result).toBe(40);
      expect(roomRepositoryMock.getDeck).toHaveBeenCalledWith(mockCode);
    });

    it('should pass through any errors from the repository', async () => {
      const mockError = new Error('Repository error');
      (roomRepositoryMock.getDeck as jest.Mock).mockRejectedValue(mockError);

      await expect(getDeckLengthUseCases.execute(mockCode)).rejects.toThrow(mockError);
    });

    it('should work with correct room code', async () => {
      const customCode = 'CUSTOM456';
      
      await getDeckLengthUseCases.execute(customCode);
      
      expect(roomRepositoryMock.getDeck).toHaveBeenCalledWith(customCode);
    });
  });
});
