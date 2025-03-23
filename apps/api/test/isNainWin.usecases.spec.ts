import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { ObjectiveCard } from '@/domain/model/card';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { IsNainWinUseCases } from '@/usecases/game/isNainWin.usecases';

describe('IsNainWinUseCases', () => {
  let isNainWinUseCases: IsNainWinUseCases;
  let loggerMock: ILogger;
  let roomRepositoryMock: RoomRepository;

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
      getDeck: jest.fn(),
      getUserGame: jest.fn(),
      setRoom: jest.fn(),
      setRound: jest.fn(),
      getCurrentRoundUser: jest.fn()
    };

    isNainWinUseCases = new IsNainWinUseCases(
      loggerMock,
      roomRepositoryMock
    );
  });

  describe('execute', () => {
    it('should return true when a treasure card is present', () => {
      // Sample objective cards with a treasure
      const revealedCards: ObjectiveCard[] = [
        {
          id: 'card1',
          type: 'STONE',
          isRevealed: true
        } as unknown as ObjectiveCard,
        {
          id: 'card2',
          type: 'TREASURE',
          isRevealed: true
        } as unknown as ObjectiveCard,
        {
          id: 'card3',
          type: 'STONE',
          isRevealed: true
        } as unknown as ObjectiveCard
      ];

      const result = isNainWinUseCases.execute(revealedCards);

      expect(result).toBe(true);
    });

    it('should return false when no treasure card is present', () => {
      // Sample objective cards with no treasure
      const revealedCards: ObjectiveCard[] = [
        {
          id: 'card1',
          type: 'STONE',
          isRevealed: true
        } as unknown as ObjectiveCard,
        {
          id: 'card2',
          type: 'STONE',
          isRevealed: true
        } as unknown as ObjectiveCard,
        {
          id: 'card3',
          type: 'STONE',
          isRevealed: true
        } as unknown as ObjectiveCard
      ];

      const result = isNainWinUseCases.execute(revealedCards);

      expect(result).toBe(false);
    });

    it('should return false for an empty array of revealed cards', () => {
      const revealedCards: ObjectiveCard[] = [];

      const result = isNainWinUseCases.execute(revealedCards);

      expect(result).toBe(false);
    });

    it('should properly handle a single treasure card', () => {
      const revealedCards: ObjectiveCard[] = [
        {
          id: 'card1',
          type: 'TREASURE',
          isRevealed: true
        } as unknown as ObjectiveCard
      ];

      const result = isNainWinUseCases.execute(revealedCards);

      expect(result).toBe(true);
    });

    it('should properly handle a single non-treasure card', () => {
      const revealedCards: ObjectiveCard[] = [
        {
          id: 'card1',
          type: 'STONE',
          isRevealed: true
        } as unknown as ObjectiveCard
      ];

      const result = isNainWinUseCases.execute(revealedCards);

      expect(result).toBe(false);
    });

    it('should handle multiple treasure cards', () => {
      // This is an edge case that probably won't happen in the real game,
      // but the function should still work properly
      const revealedCards: ObjectiveCard[] = [
        {
          id: 'card1',
          type: 'TREASURE',
          isRevealed: true
        } as unknown as ObjectiveCard,
        {
          id: 'card2',
          type: 'TREASURE',
          isRevealed: true
        } as unknown as ObjectiveCard
      ];

      const result = isNainWinUseCases.execute(revealedCards);

      expect(result).toBe(true);
    });

    it('should handle cards with different case for type', () => {
      const revealedCards: ObjectiveCard[] = [
        {
          id: 'card1',
          type: 'treasure',
          isRevealed: true
        } as unknown as ObjectiveCard
      ];

      const result = isNainWinUseCases.execute(revealedCards);

      expect(result).toBe(false);
    });

    it('should handle undefined type property', () => {
      const revealedCards: ObjectiveCard[] = [
        {
          id: 'card1',
          isRevealed: true
        } as unknown as ObjectiveCard
      ];

      const result = isNainWinUseCases.execute(revealedCards);

      expect(result).toBe(false);
    });

    it('should check all cards even if the first one is not a treasure', () => {
      const revealedCards: ObjectiveCard[] = [
        {
          id: 'card1',
          type: 'STONE',
          isRevealed: true
        } as unknown as ObjectiveCard,
        {
          id: 'card2',
          type: 'TREASURE',
          isRevealed: true
        } as unknown as ObjectiveCard
      ];

      const result = isNainWinUseCases.execute(revealedCards);

      expect(result).toBe(true);
    });

    it('should check all cards even if the last one is a treasure', () => {
      const revealedCards: ObjectiveCard[] = [
        {
          id: 'card1',
          type: 'STONE',
          isRevealed: true
        } as unknown as ObjectiveCard,
        {
          id: 'card2',
          type: 'STONE',
          isRevealed: true
        } as unknown as ObjectiveCard,
        {
          id: 'card3',
          type: 'TREASURE',
          isRevealed: true
        } as unknown as ObjectiveCard
      ];

      const result = isNainWinUseCases.execute(revealedCards);

      expect(result).toBe(true);
    });
  });
});
