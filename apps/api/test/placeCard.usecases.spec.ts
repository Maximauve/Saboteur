import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { Board } from '@/domain/model/board';
import { Card, CardType, Connection } from '@/domain/model/card';
import { Move, PlacedMove } from '@/domain/model/move';
import { Round } from '@/domain/model/round';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { TranslationService } from '@/infrastructure/services/translation/translation.service';
import { PlaceCardUseCases } from '@/usecases/game/placeCard.usecases';

describe('PlaceCardUseCases', () => {
  let placeCardUseCases: PlaceCardUseCases;
  let loggerMock: ILogger;
  let roomRepositoryMock: RoomRepository;
  let translationServiceMock: TranslationService;

  const mockCode = 'TEST123';
  
  const straightCard: Card = {
    id: 'straight-card',
    type: CardType.PATH,
    connections: [Connection.TOP, Connection.BOTTOM],
    isFlipped: false,
    tools: [],
    imageUrl: ''
  };
  
  const cornerCard: Card = {
    id: 'corner-card',
    type: CardType.PATH,
    connections: [Connection.TOP, Connection.RIGHT],
    isFlipped: false,
    tools: [],
    imageUrl: ''
  };
  
  const deadEndCard: Card = {
    id: 'deadend-card',
    type: CardType.PATH,
    connections: [Connection.TOP],
    isFlipped: false,
    tools: [],
    imageUrl: ''
  };
  
  const tJunctionCard: Card = {
    id: 'tjunction-card',
    type: CardType.PATH,
    connections: [Connection.TOP, Connection.RIGHT, Connection.LEFT],
    isFlipped: false,
    tools: [],
    imageUrl: ''
  };
  
  const crossCard: Card = {
    id: 'cross-card',
    type: CardType.PATH,
    connections: [Connection.TOP, Connection.RIGHT, Connection.LEFT, Connection.BOTTOM],
    isFlipped: false,
    tools: [],
    imageUrl: ''
  };

  const createEmptyGrid = (): (Card | null)[][] => {
    return Array.from({ length: 9 }, () => Array.from({ length: 13 }, () => null));
  };
  
  const createMockRound = (grid: (Card | null)[][]): Round => {
    const startCard: Card = {
      id: 'start-card',
      type: CardType.START,
      connections: [Connection.TOP, Connection.RIGHT, Connection.LEFT, Connection.BOTTOM],
      isFlipped: false,
      tools: [],
      imageUrl: ''
    };
    
    if (grid[4][2] === null) {
      grid[4][2] = startCard;
    }
    
    return {
      index: 1,
      board: {
        grid,
        startCard,
        objectivePositions: []
      },
      users: [],
      deck: [],
      objectiveCards: [],
      treasurePosition: 0,
      goldList: [],
      revealedCards: []
    };
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

    translationServiceMock = {
      translate: jest.fn().mockImplementation(key => Promise.resolve(key))
    } as unknown as TranslationService;

    placeCardUseCases = new PlaceCardUseCases(
      loggerMock,
      roomRepositoryMock,
      translationServiceMock
    );
  });

  describe('execute', () => {
    it('should place a card on a valid position next to the start card', async () => {
      const grid = createEmptyGrid();
      const mockRound = createMockRound(grid);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const move: Move = {
        card: { ...straightCard },
        x: 5,
        y: 2
      };
      
      await placeCardUseCases.execute(mockCode, move);
      
      expect(mockRound.board.grid[5][2]).toEqual(move.card);
      expect(roomRepositoryMock.setRound).toHaveBeenCalledWith(
        mockCode,
        mockRound.index,
        [
          'board', JSON.stringify(mockRound.board),
          'users', JSON.stringify(mockRound.users),
          'deck', JSON.stringify(mockRound.deck)
        ]
      );
    });

    it('should throw an error when trying to place a card on an occupied position', async () => {
      const grid = createEmptyGrid();
      const mockRound = createMockRound(grid);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const move: Move = {
        card: { ...straightCard },
        x: 4,
        y: 2
      };
      
      await expect(placeCardUseCases.execute(mockCode, move))
        .rejects
        .toThrow('error.CARD_CANNOT_BE_PLACED');
      
      expect(mockRound.board.grid[4][2]).not.toEqual(move.card);
      expect(roomRepositoryMock.setRound).not.toHaveBeenCalled();
    });

    it('should flip card connections when isFlipped is true', async () => {
      const grid = createEmptyGrid();
      const mockRound = createMockRound(grid);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const flippedCard: Card = {
        ...deadEndCard,
        isFlipped: true,
      };
      
      const move: Move = {
        card: flippedCard,
        x: 3,
        y: 2
      };
      
      await placeCardUseCases.execute(mockCode, move);
      
      expect(mockRound.board.grid[3][2]?.connections).toEqual([Connection.BOTTOM]);
      expect(roomRepositoryMock.setRound).toHaveBeenCalled();
    });

    it('should throw an error when trying to place a card with no adjacent cards', async () => {
      const grid = createEmptyGrid();
      const mockRound = createMockRound(grid);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const move: Move = {
        card: { ...straightCard },
        x: 0,
        y: 0
      };
      
      await expect(placeCardUseCases.execute(mockCode, move))
        .rejects
        .toThrow('error.CARD_CANNOT_BE_PLACED');
      
      expect(mockRound.board.grid[0][0]).not.toEqual(move.card);
      expect(roomRepositoryMock.setRound).not.toHaveBeenCalled();
    });

    it('should throw an error when card placement would create invalid connections', async () => {
      const grid = createEmptyGrid();
      const mockRound = createMockRound(grid);
      
      grid[4][3] = { ...straightCard, connections: [Connection.LEFT, Connection.RIGHT] };
      
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const move: Move = {
        card: { ...deadEndCard },
        x: 5,
        y: 3
      };
      
      await expect(placeCardUseCases.execute(mockCode, move))
        .rejects
        .toThrow('error.CARD_CANNOT_BE_PLACED');
      
      expect(mockRound.board.grid[5][3]).not.toEqual(move.card);
      expect(roomRepositoryMock.setRound).not.toHaveBeenCalled();
    });

    it('should place a corner card correctly', async () => {
      const grid = createEmptyGrid();
      const mockRound = createMockRound(grid);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const move: Move = {
        card: { ...cornerCard },
        x: 5,
        y: 2
      };
      
      await placeCardUseCases.execute(mockCode, move);
      
      expect(mockRound.board.grid[5][2]).toEqual(move.card);
      expect(roomRepositoryMock.setRound).toHaveBeenCalled();
    });

    it('should place a T-junction card correctly', async () => {
      const grid = createEmptyGrid();
      const mockRound = createMockRound(grid);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const move: Move = {
        card: { ...tJunctionCard },
        x: 5,
        y: 2
      };
      
      await placeCardUseCases.execute(mockCode, move);
      
      expect(mockRound.board.grid[5][2]).toEqual(move.card);
      expect(roomRepositoryMock.setRound).toHaveBeenCalled();
    });

    it('should place a cross card correctly', async () => {
      const grid = createEmptyGrid();
      const mockRound = createMockRound(grid);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const move: Move = {
        card: { ...crossCard },
        x: 5,
        y: 2
      };
      
      await placeCardUseCases.execute(mockCode, move);
      
      expect(mockRound.board.grid[5][2]).toEqual(move.card);
      expect(roomRepositoryMock.setRound).toHaveBeenCalled();
    });

    it('should validate connections on all sides', async () => {
      const grid = createEmptyGrid();
      const mockRound = createMockRound(grid);
      
      grid[4][3] = { ...straightCard, connections: [Connection.LEFT, Connection.RIGHT] };
      grid[4][5] = { ...straightCard, connections: [Connection.LEFT, Connection.RIGHT] };
      grid[3][4] = { ...straightCard, connections: [Connection.TOP, Connection.BOTTOM] };
      grid[5][4] = { ...straightCard, connections: [Connection.TOP, Connection.BOTTOM] };
      
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const move: Move = {
        card: { ...crossCard },
        x: 4,
        y: 4
      };
      
      await placeCardUseCases.execute(mockCode, move);
      
      expect(mockRound.board.grid[4][4]).toEqual(move.card);
      expect(roomRepositoryMock.setRound).toHaveBeenCalled();
    });

    it('should throw an error when move does not have x and y coordinates', async () => {
      const grid = createEmptyGrid();
      const mockRound = createMockRound(grid);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const move: Move = {
        card: { ...straightCard }
      };
      
      await expect(placeCardUseCases.execute(mockCode, move))
        .rejects
        .toThrow('error.CARD_CANNOT_BE_PLACED');
      
      expect(roomRepositoryMock.setRound).not.toHaveBeenCalled();
    });

    it('should handle edge cases near board boundaries', async () => {
      const grid = createEmptyGrid();
      const mockRound = createMockRound(grid);
      
      grid[4][1] = { ...straightCard, connections: [Connection.LEFT, Connection.RIGHT] };
      
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const move: Move = {
        card: { ...straightCard, connections: [Connection.LEFT, Connection.RIGHT] },
        x: 4,
        y: 0
      };
      
      await placeCardUseCases.execute(mockCode, move);
      
      expect(mockRound.board.grid[4][0]).toEqual(move.card);
      expect(roomRepositoryMock.setRound).toHaveBeenCalled();
    });

    it('should handle repository errors properly', async () => {
      const mockError = new Error('Repository error');
      (roomRepositoryMock.getRound as jest.Mock).mockRejectedValue(mockError);
      
      const move: Move = {
        card: { ...straightCard },
        x: 5,
        y: 2
      };
      
      await expect(placeCardUseCases.execute(mockCode, move)).rejects.toThrow(mockError);
      expect(roomRepositoryMock.setRound).not.toHaveBeenCalled();
    });
  });
});
