import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { Round } from '@/domain/model/round';
import { Board } from '@/domain/model/board';
import { Card, CardType, Tool } from '@/domain/model/card';
import { Move } from '@/domain/model/move';
import { UserGame } from '@/domain/model/user';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { TranslationService } from '@/infrastructure/services/translation/translation.service';
import { RepairlayerUseCases } from '@/usecases/game/repairPlayer.usecases';

describe('RepairlayerUseCases', () => {
  let repairPlayerUseCases: RepairlayerUseCases;
  let loggerMock: ILogger;
  let roomRepositoryMock: RoomRepository;
  let translationServiceMock: TranslationService;

  const mockCode = 'TEST123';
  
  // Sample users 
  const mockUsers: UserGame[] = [
    {
      userId: 'user1',
      username: 'User 1',
      hasToPlay: true,
      cards: [],
      isSaboteur: false,
      malus: [],
      cardsRevealed: [],
      hasToChooseGold: false,
      socketId: '',
      ready: false,
      gold: 0,
      isHost: false
    },
    {
      userId: 'user2',
      username: 'User 2',
      hasToPlay: false,
      cards: [],
      isSaboteur: false,
      malus: [
        {
          id: 'malus1',
          type: CardType.BROKEN_TOOL,
          tools: [Tool.PICKAXE],
          isFlipped: false,
          connections: [],
          imageUrl: ''
        }
      ],
      cardsRevealed: [],
      hasToChooseGold: false,
      socketId: '',
      ready: false,
      gold: 0,
      isHost: false
    },
    {
      userId: 'user3',
      username: 'User 3',
      hasToPlay: false,
      cards: [],
      isSaboteur: false,
      malus: [
        {
          id: 'malus2',
          type: CardType.BROKEN_TOOL,
          tools: [Tool.WAGON],
          isFlipped: false,
          connections: [],
          imageUrl: ''
        },
        {
          id: 'malus3',
          type: CardType.BROKEN_TOOL,
          tools: [Tool.LANTERN],
          isFlipped: false,
          connections: [],
          imageUrl: ''
        }
      ],
      cardsRevealed: [],
      hasToChooseGold: false,
      socketId: '',
      ready: false,
      gold: 0,
      isHost: false
    }
  ];
  
  const pickaxeRepairCard: Card = {
    id: 'repair-pickaxe',
    type: CardType.REPAIR_TOOL,
    tools: [Tool.PICKAXE],
    isFlipped: false,
    connections: [],
    imageUrl: ''
  };
  
  const wagonRepairCard: Card = {
    id: 'repair-wagon',
    type: CardType.REPAIR_TOOL,
    tools: [Tool.WAGON],
    isFlipped: false,
    connections: [],
    imageUrl: ''
  };
  
  const lanternRepairCard: Card = {
    id: 'repair-lantern',
    type: CardType.REPAIR_TOOL,
    tools: [Tool.LANTERN],
    isFlipped: false,
    connections: [],
    imageUrl: ''
  };
  
  const multiToolRepairCard: Card = {
    id: 'repair-multi',
    type: CardType.REPAIR_TOOL,
    tools: [Tool.PICKAXE, Tool.WAGON],
    isFlipped: false,
    connections: [],
    imageUrl: ''
  };

  const createMockRound = (users: UserGame[]): Round => {
    return {
      index: 1,
      users,
      board: {} as Board,
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

    repairPlayerUseCases = new RepairlayerUseCases(
      loggerMock,
      roomRepositoryMock,
      translationServiceMock
    );
  });

  describe('execute', () => {
    it('should repair a broken tool successfully', async () => {
      const mockRound = createMockRound([...mockUsers]);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const move: Move = {
        card: pickaxeRepairCard,
        userReceiver: {
          userId: 'user2', username: 'User 2',
          socketId: '',
          ready: false,
          gold: 0,
          isHost: false
        },
        targettedMalusCard: {
          id: 'malus1',
          type: CardType.BROKEN_TOOL,
          tools: [Tool.PICKAXE],
          isFlipped: false,
          connections: [],
          imageUrl: ''
        }
      };
      
      await repairPlayerUseCases.execute(mockCode, move);
      
      expect(mockRound.users[1].malus).toEqual([]);
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

    it('should throw an error if userReceiver is not provided', async () => {
      const mockRound = createMockRound([...mockUsers]);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const move: Move = {
        card: pickaxeRepairCard,
        targettedMalusCard: {
          id: 'malus1',
          type: CardType.BROKEN_TOOL,
          tools: [Tool.PICKAXE],
          isFlipped: false,
          connections: [],
          imageUrl: ''
        }
      };
      
      await expect(repairPlayerUseCases.execute(mockCode, move))
        .rejects
        .toThrow('error.USER_NOT_FOUND');
      
      expect(roomRepositoryMock.setRound).not.toHaveBeenCalled();
    });

    it('should throw an error if user is not found in the round', async () => {
      const mockRound = createMockRound([...mockUsers]);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const move: Move = {
        card: pickaxeRepairCard,
        userReceiver: {
          userId: 'nonexistent', username: 'Nonexistent User',
          socketId: '',
          ready: false,
          gold: 0,
          isHost: false
        },
        targettedMalusCard: {
          id: 'malus1',
          type: CardType.BROKEN_TOOL,
          tools: [Tool.PICKAXE],
          isFlipped: false,
          connections: [],
          imageUrl: ''
        }
      };
      
      await expect(repairPlayerUseCases.execute(mockCode, move))
        .rejects
        .toThrow('error.USER_NOT_FOUND');
      
      expect(roomRepositoryMock.setRound).not.toHaveBeenCalled();
    });

    it('should throw an error if targettedMalusCard is not a broken tool', async () => {
      const mockRound = createMockRound([...mockUsers]);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const move: Move = {
        card: pickaxeRepairCard,
        userReceiver: {
          userId: 'user2', username: 'User 2',
          socketId: '',
          ready: false,
          gold: 0,
          isHost: false
        },
        targettedMalusCard: {
          id: 'not-a-malus',
          type: CardType.PATH,
          tools: [Tool.PICKAXE],
          isFlipped: false,
          connections: [],
          imageUrl: ''
        }
      };
      
      await expect(repairPlayerUseCases.execute(mockCode, move))
        .rejects
        .toThrow('error.CARD_NOT_BROKEN_TOOL');
      
      expect(roomRepositoryMock.setRound).not.toHaveBeenCalled();
    });

    it('should throw an error if the tool is not actually broken', async () => {
      const mockRound = createMockRound([...mockUsers]);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const move: Move = {
        card: lanternRepairCard,
        userReceiver: {
          userId: 'user2', username: 'User 2',
          socketId: '',
          ready: false,
          gold: 0,
          isHost: false
        },
        targettedMalusCard: {
          id: 'malus-nonexistent',
          type: CardType.BROKEN_TOOL,
          tools: [Tool.LANTERN],
          isFlipped: false,
          connections: [],
          imageUrl: ''
        }
      };
      
      await expect(repairPlayerUseCases.execute(mockCode, move))
        .rejects
        .toThrow('error.TOOL_NOT_BROKEN');
      
      expect(roomRepositoryMock.setRound).not.toHaveBeenCalled();
    });

    it('should throw an error if the repair card cannot repair the broken tool', async () => {
      const mockRound = createMockRound([...mockUsers]);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const move: Move = {
        card: wagonRepairCard,
        userReceiver: {
          userId: 'user2', username: 'User 2',
          socketId: '',
          ready: false,
          gold: 0,
          isHost: false
        },
        targettedMalusCard: {
          id: 'malus1',
          type: CardType.BROKEN_TOOL,
          tools: [Tool.PICKAXE],
          isFlipped: false,
          connections: [],
          imageUrl: ''
        }
      };
      
      await expect(repairPlayerUseCases.execute(mockCode, move))
        .rejects
        .toThrow('error.TOOL_NOT_BROKEN');
      
      expect(roomRepositoryMock.setRound).not.toHaveBeenCalled();
    });

    it('should repair a specific tool when user has multiple broken tools', async () => {
      const mockRound = createMockRound([...mockUsers]);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const move: Move = {
        card: wagonRepairCard,
        userReceiver: {
          userId: 'user3', username: 'User 3',
          socketId: '',
          ready: false,
          gold: 0,
          isHost: false
        },
        targettedMalusCard: {
          id: 'malus2',
          type: CardType.BROKEN_TOOL,
          tools: [Tool.WAGON],
          isFlipped: false,
          connections: [],
          imageUrl: ''
        }
      };
      
      await repairPlayerUseCases.execute(mockCode, move);
      
      expect(mockRound.users[2].malus).toEqual([
        {
          id: 'malus3',
          type: CardType.BROKEN_TOOL,
          tools: [Tool.LANTERN],
          isFlipped: false,
          connections: [],
          imageUrl: ''
        }
      ]);
      expect(roomRepositoryMock.setRound).toHaveBeenCalled();
    });

    it('should handle a user with no malus cards gracefully', async () => {
      const mockRound = createMockRound([...mockUsers]);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const move: Move = {
        card: pickaxeRepairCard,
        userReceiver: {
          userId: 'user1', username: 'User 1',
          socketId: '',
          ready: false,
          gold: 0,
          isHost: false
        },
        targettedMalusCard: {
          id: 'malus-nonexistent',
          type: CardType.BROKEN_TOOL,
          tools: [Tool.PICKAXE],
          isFlipped: false,
          connections: [],
          imageUrl: ''
        }
      };
      
      await expect(repairPlayerUseCases.execute(mockCode, move))
        .rejects
        .toThrow('error.TOOL_NOT_BROKEN');
      
      expect(roomRepositoryMock.setRound).not.toHaveBeenCalled();
    });

    it('should validate that targettedMalusCard is provided', async () => {
      const mockRound = createMockRound([...mockUsers]);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const move: Move = {
        card: pickaxeRepairCard,
        userReceiver: {
          userId: 'user2', username: 'User 2',
          socketId: '',
          ready: false,
          gold: 0,
          isHost: false
        }
      };
      
      await expect(repairPlayerUseCases.execute(mockCode, move))
        .rejects
        .toThrow('error.CARD_NOT_BROKEN_TOOL');
      
      expect(roomRepositoryMock.setRound).not.toHaveBeenCalled();
    });

    it('should fail when card has no tools defined', async () => {
      const mockRound = createMockRound([...mockUsers]);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const badRepairCard: Card = {
        id: 'bad-repair',
        type: CardType.REPAIR_TOOL,
        tools: [],
        isFlipped: false,
        connections: [],
        imageUrl: ''
      };
      
      const move: Move = {
        card: badRepairCard,
        userReceiver: {
          userId: 'user2', username: 'User 2',
          socketId: '',
          ready: false,
          gold: 0,
          isHost: false
        },
        targettedMalusCard: {
          id: 'malus1',
          type: CardType.BROKEN_TOOL,
          tools: [Tool.PICKAXE],
          isFlipped: false,
          connections: [],
          imageUrl: ''
        }
      };
      
      await expect(repairPlayerUseCases.execute(mockCode, move))
        .rejects
        .toThrow('error.TOOL_NOT_BROKEN');
      
      expect(roomRepositoryMock.setRound).not.toHaveBeenCalled();
    });

    it('should handle errors from the repository', async () => {
      const mockError = new Error('Repository error');
      (roomRepositoryMock.getRound as jest.Mock).mockRejectedValue(mockError);
      
      const move: Move = {
        card: pickaxeRepairCard,
        userReceiver: {
          userId: 'user2', username: 'User 2',
          socketId: '',
          ready: false,
          gold: 0,
          isHost: false
        },
        targettedMalusCard: {
          id: 'malus1',
          type: CardType.BROKEN_TOOL,
          tools: [Tool.PICKAXE],
          isFlipped: false,
          connections: [],
          imageUrl: ''
        }
      };
      
      await expect(repairPlayerUseCases.execute(mockCode, move)).rejects.toThrow(mockError);
      expect(roomRepositoryMock.setRound).not.toHaveBeenCalled();
    });

    it('should throw specific error when translation service fails', async () => {
      const mockError = new Error('Translation error');
      (translationServiceMock.translate as jest.Mock).mockRejectedValue(mockError);
      
      const move: Move = {
        card: pickaxeRepairCard
      };
      
      await expect(repairPlayerUseCases.execute(mockCode, move)).rejects.toThrow('Translation error');
      expect(roomRepositoryMock.setRound).not.toHaveBeenCalled();
    });

    it('should handle multiple malus cards for the same tool', async () => {
      const usersWithDuplicateMalus = [...mockUsers];
      usersWithDuplicateMalus[1].malus = [
        {
          id: 'malus1',
          type: CardType.BROKEN_TOOL,
          tools: [Tool.PICKAXE],
          isFlipped: false,
          connections: [],
          imageUrl: ''
        },
        {
          id: 'malus1-duplicate',
          type: CardType.BROKEN_TOOL,
          tools: [Tool.PICKAXE],
          isFlipped: false,
          connections: [],
          imageUrl: ''
        }
      ];
      
      const mockRound = createMockRound(usersWithDuplicateMalus);
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(mockRound);
      
      const move: Move = {
        card: pickaxeRepairCard,
        userReceiver: {
          userId: 'user2', username: 'User 2',
          socketId: '',
          ready: false,
          gold: 0,
          isHost: false
        },
        targettedMalusCard: {
          id: 'malus1',
          type: CardType.BROKEN_TOOL,
          tools: [Tool.PICKAXE],
          isFlipped: false,
          connections: [],
          imageUrl: ''
        }
      };
      
      await repairPlayerUseCases.execute(mockCode, move);
      
      expect(mockRound.users[1].malus).toEqual([]);
      expect(roomRepositoryMock.setRound).toHaveBeenCalled();
    });
  });
});
