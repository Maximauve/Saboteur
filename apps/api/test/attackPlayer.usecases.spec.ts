import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { Card, CardType, Tool } from '@/domain/model/card';
import { Move } from '@/domain/model/move';
import { UserGame } from '@/domain/model/user';
import { Round } from '@/domain/model/round';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { TranslationService } from '@/infrastructure/services/translation/translation.service';
import { AttackPlayerUseCases } from '@/usecases/game/attackPlayer.usecases';
import { I18nService } from 'nestjs-i18n';

describe('AttackPlayerUseCases', () => {
  let attackPlayerUseCases: AttackPlayerUseCases;
  let loggerMock: ILogger;
  let roomRepositoryMock: RoomRepository;
  let translationServiceMock: TranslationService;

  const mockCode = 'TEST123';
  
  // Sample cards with tools
  const lanternCard: Card = {
    id: 'card1',
    tools: [Tool.LANTERN],
    type: CardType.BROKEN_TOOL,
    connections: [],
    imageUrl: ''
  };
  
  const pickaxeCard: Card = {
    id: 'card2',
    tools: [Tool.PICKAXE],
    type: CardType.BROKEN_TOOL,
    connections: [],
    imageUrl: ''
  };
  
  // Sample users
  const attacker: UserGame = {
    userId: 'attacker-id',
    username: 'Attacker',
    socketId: 'socket1',
    gold: 0,
    cards: [],
    malus: [],
    isHost: false,
    ready: true,
    isSaboteur: false,
    cardsRevealed: [],
    hasToPlay: false,
    hasToChooseGold: false
  };
  
  const receiver: UserGame = {
    userId: 'receiver-id',
    username: 'Receiver',
    socketId: 'socket2',
    gold: 0,
    cards: [],
    malus: [],
    isHost: false,
    ready: true,
    isSaboteur: false,
    cardsRevealed: [],
    hasToPlay: false,
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
    users: [attacker, receiver],
    deck: [{} as Card],
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
      setRound: jest.fn().mockResolvedValue(undefined),
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

    // Initialize use case directly
    attackPlayerUseCases = new AttackPlayerUseCases(
      loggerMock,
      roomRepositoryMock,
      translationServiceMock
    );
  });

  describe('execute', () => {
    it('should attack player successfully', async () => {
      // Set up the move
      const move: Move = {
        x: 0,
        y: 0,
        card: lanternCard,
        userReceiver: receiver
      };

      // Execute the use case
      await attackPlayerUseCases.execute(mockCode, move);

      // Verify room repository was called with correct parameters
      expect(roomRepositoryMock.getRound).toHaveBeenCalledWith(mockCode);
      expect(roomRepositoryMock.setRound).toHaveBeenCalledWith(
        mockCode,
        1,
        [
          'board', JSON.stringify(mockRound.board),
          'users', JSON.stringify([
            attacker,
            { ...receiver, malus: [lanternCard] }
          ]),
          'deck', JSON.stringify(mockRound.deck)
        ]
      );
    });

    it('should throw error if userReceiver is not provided', async () => {
      // Set up the move without a user receiver
      const move: Move = {
        x: 0,
        y: 0,
        card: lanternCard,
        userReceiver: undefined
      };

      // Execute and expect error
      await expect(attackPlayerUseCases.execute(mockCode, move))
        .rejects.toThrow('error.USER_NOT_FOUND');
      
      expect(translationServiceMock.translate).toHaveBeenCalledWith('error.USER_NOT_FOUND');
      expect(roomRepositoryMock.setRound).not.toHaveBeenCalled();
    });

    it('should throw error if receiver is not found in the round', async () => {
      // Set up a non-existent receiver
      const nonExistentReceiver: UserGame = {
        userId: 'non-existent',
        username: 'Non Existent',
        socketId: 'socket3',
        gold: 0,
        cards: [],
        malus: [],
        isHost: false,
        ready: true,
        isSaboteur: false,
        cardsRevealed: [],
        hasToPlay: false,
        hasToChooseGold: false
      };

      const move: Move = {
        x: 0,
        y: 0,
        card: lanternCard,
        userReceiver: nonExistentReceiver
      };

      // Execute and expect error
      await expect(attackPlayerUseCases.execute(mockCode, move))
        .rejects.toThrow('error.USER_NOT_FOUND');
      
      expect(translationServiceMock.translate).toHaveBeenCalledWith('error.USER_NOT_FOUND');
      expect(roomRepositoryMock.setRound).not.toHaveBeenCalled();
    });

    it('should throw error if tool is already broken', async () => {
      // Set up a receiver that already has a broken lantern
      const receiverWithBrokenTools = {
        ...receiver,
        malus: [lanternCard]
      };

      // Update the mock round to include this user
      const updatedRound = {
        ...mockRound,
        users: [attacker, receiverWithBrokenTools]
      };

      roomRepositoryMock.getRound = jest.fn().mockResolvedValue(updatedRound);

      // Try to break the lantern again
      const move: Move = {
        x: 0,
        y: 0,
        card: lanternCard,
        userReceiver: receiverWithBrokenTools
      };

      // Execute and expect error
      await expect(attackPlayerUseCases.execute(mockCode, move))
        .rejects.toThrow('error.TOOL_ALREADY_BROKEN');
      
      expect(translationServiceMock.translate).toHaveBeenCalledWith('error.TOOL_ALREADY_BROKEN');
      expect(roomRepositoryMock.setRound).not.toHaveBeenCalled();
    });

    it('should attack successfully even if other tools are broken', async () => {
      // Set up a receiver that has a broken lantern but we're attacking with a pickaxe
      const receiverWithBrokenLantern = {
        ...receiver,
        malus: [lanternCard]
      };

      // Update the mock round to include this user
      const updatedRound = {
        ...mockRound,
        users: [attacker, receiverWithBrokenLantern]
      };

      roomRepositoryMock.getRound = jest.fn().mockResolvedValue(updatedRound);

      // Try to break the pickaxe
      const move: Move = {
        x: 0,
        y: 0,
        card: pickaxeCard,
        userReceiver: receiverWithBrokenLantern
      };

      // Execute
      await attackPlayerUseCases.execute(mockCode, move);

      // Verify the player's malus was updated with both cards
      expect(roomRepositoryMock.setRound).toHaveBeenCalledWith(
        mockCode,
        1,
        [
          'board', JSON.stringify(updatedRound.board),
          'users', JSON.stringify([
            attacker,
            { ...receiverWithBrokenLantern, malus: [lanternCard, pickaxeCard] }
          ]),
          'deck', JSON.stringify(updatedRound.deck)
        ]
      );
    });

    it('should handle cards with multiple tools correctly', async () => {
      // Create a card with multiple tools
      const multiToolCard: Card = {
        id: 'multiTool',
        tools: [Tool.LANTERN, Tool.PICKAXE],
        type: CardType.BROKEN_TOOL,
        connections: [],
        imageUrl: ''
      };
      
      // Set up a receiver that has a broken lantern
      const receiverWithBrokenLantern = {
        ...receiver,
        malus: [lanternCard]
      };

      // Update the mock round to include this user
      const updatedRound = {
        ...mockRound,
        users: [attacker, receiverWithBrokenLantern]
      };

      roomRepositoryMock.getRound = jest.fn().mockResolvedValue(updatedRound);

      // Try to use a multi-tool card that includes an already broken tool
      const move: Move = {
        x: 0,
        y: 0,
        card: multiToolCard,
        userReceiver: receiverWithBrokenLantern
      };

      // Execute and expect error because one of the tools is already broken
      await expect(attackPlayerUseCases.execute(mockCode, move))
        .rejects.toThrow('error.TOOL_ALREADY_BROKEN');
      
      expect(translationServiceMock.translate).toHaveBeenCalledWith('error.TOOL_ALREADY_BROKEN');
      expect(roomRepositoryMock.setRound).not.toHaveBeenCalled();
    });
  });
});
