import { ILogger } from '@/domain/logger/logger.interface';
import { Card, CardType } from '@/domain/model/card';
import { UserGame, UserSocket, UserRoom } from '@/domain/model/user';
import { Round } from '@/domain/model/round';
import { Room } from '@/domain/model/room';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { TranslationService } from '@/infrastructure/services/translation/translation.service';
import { ChooseGoldUseCases } from '@/usecases/game/chooseGold.usecases';

describe('ChooseGoldUseCases', () => {
  let chooseGoldUseCases: ChooseGoldUseCases;
  let loggerMock: ILogger;
  let roomRepositoryMock: RoomRepository;
  let translationServiceMock: TranslationService;

  const mockCode = 'TEST123';
  
  const userSocket: UserSocket = {
    userId: 'user1',
    username: 'User 1',
    socketId: '',
    ready: false,
    gold: 0,
    isHost: false
  };
  
  const user1: UserGame = {
    userId: 'user1',
    username: 'User 1',
    socketId: 'socket1',
    gold: 0,
    cards: [],
    malus: [],
    isHost: true,
    ready: true,
    isSaboteur: false,
    cardsRevealed: [],
    hasToPlay: false,
    hasToChooseGold: true
  };
  
  const user2: UserGame = {
    userId: 'user2',
    username: 'User 2',
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
  
  const user3: UserGame = {
    userId: 'user3',
    username: 'User 3',
    socketId: 'socket3',
    gold: 0,
    cards: [],
    malus: [],
    isHost: false,
    ready: true,
    isSaboteur: true,
    cardsRevealed: [],
    hasToPlay: false,
    hasToChooseGold: false
  };

  const roomUser1: UserGame = {
    userId: 'user1',
    username: 'User 1',
    ready: true,
    isHost: true,
    socketId: 'socket1',
    gold: 0,
    cards: [],
    isSaboteur: false,
    cardsRevealed: [],
    malus: [],
    hasToPlay: false,
    hasToChooseGold: false
  };
  
  const roomUser2: UserGame = {
    userId: 'user2',
    username: 'User 2',
    ready: true,
    isHost: false,
    socketId: 'socket2',
    gold: 0,
    cards: [],
    isSaboteur: false,
    cardsRevealed: [],
    malus: [],
    hasToPlay: false,
    hasToChooseGold: false
  };
  
  const roomUser3: UserGame = {
    userId: 'user3',
    username: 'User 3',
    ready: true,
    isHost: false,
    socketId: 'socket3',
    gold: 0,
    cards: [],
    isSaboteur: false,
    cardsRevealed: [],
    malus: [],
    hasToPlay: false,
    hasToChooseGold: false
  };

  const mockRound: Round = {
    index: 1,
    board: {
      grid: [],
      startCard: {} as Card,
      objectivePositions: []
    },
    users: [user1, user2, user3],
    deck: [{} as Card],
    objectiveCards: [],
    treasurePosition: 0,
    goldList: [1, 2, 3],
    revealedCards: []
  };

  // Sample room data
  const mockRoom: Room = {
    code: mockCode,
    users: [roomUser1, roomUser2, roomUser3],
    currentRound: 1,
    host: new UserRoom,
    started: false,
    goldDeck: [],
    messages: []
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
      getRoom: jest.fn().mockResolvedValue(mockRoom),
      getRound: jest.fn().mockResolvedValue(mockRound),
      setRoom: jest.fn().mockResolvedValue(undefined),
      setRound: jest.fn().mockResolvedValue(undefined),
      getRoomUsers: jest.fn(),
      getSocketId: jest.fn(),
      isHost: jest.fn(),
      gameIsStarted: jest.fn(),
      doesRoomExists: jest.fn(),
      getBoard: jest.fn(),
      getDeck: jest.fn(),
      getUserGame: jest.fn(),
      getCurrentRoundUser: jest.fn()
    };

    translationServiceMock = {
      translate: jest.fn().mockImplementation(key => Promise.resolve(key))
    } as unknown as TranslationService;

    chooseGoldUseCases = new ChooseGoldUseCases(
      loggerMock,
      roomRepositoryMock,
      translationServiceMock
    );
  });

  describe('execute', () => {
    it('should allow user to choose gold and update game state correctly', async () => {
      const result = await chooseGoldUseCases.execute(mockCode, userSocket, 2);

      const expectedGoldList = [1, 3];
      const expectedRoomUsers = [
        { ...roomUser1, gold: 2 },
        roomUser2,
        roomUser3
      ];
      const expectedRoundUsers = [
        { ...user1, hasToChooseGold: false },
        { ...user2, hasToChooseGold: true },
        user3
      ];

      expect(result).toEqual(expectedGoldList);
      
      expect(roomRepositoryMock.getRoom).toHaveBeenCalledWith(mockCode);
      expect(roomRepositoryMock.getRound).toHaveBeenCalledWith(mockCode);
      
      expect(roomRepositoryMock.setRoom).toHaveBeenCalledWith(
        mockCode,
        [
          'users',
          JSON.stringify(expectedRoomUsers)
        ]
      );
      
      expect(roomRepositoryMock.setRound).toHaveBeenCalledWith(
        mockCode,
        1,
        [
          'goldList',
          JSON.stringify(expectedGoldList),
          'users',
          JSON.stringify(expectedRoundUsers)
        ]
      );
    });

    it('should throw an error if user is not found', async () => {
      const nonExistentUser: UserSocket = {
        userId: 'nonexistent',
        username: 'Nonexistent User',
        socketId: '',
        ready: false,
        gold: 0,
        isHost: false
      };

      await expect(chooseGoldUseCases.execute(mockCode, nonExistentUser, 2))
        .rejects.toThrow('error.USER_NOT_FOUND');
      
      expect(translationServiceMock.translate).toHaveBeenCalledWith('error.USER_NOT_FOUND');
      expect(roomRepositoryMock.setRoom).not.toHaveBeenCalled();
      expect(roomRepositoryMock.setRound).not.toHaveBeenCalled();
    });

    it('should throw an error if user cannot choose gold', async () => {
      const modifiedRound = {
        ...mockRound,
        users: [
          { ...user1, hasToChooseGold: false },
          { ...user2, hasToChooseGold: true },
          user3
        ]
      };
      roomRepositoryMock.getRound = jest.fn().mockResolvedValue(modifiedRound);

      await expect(chooseGoldUseCases.execute(mockCode, userSocket, 2))
        .rejects.toThrow('error.NOT_CHOOSE_GOLD');
      
      expect(translationServiceMock.translate).toHaveBeenCalledWith('error.NOT_CHOOSE_GOLD');
      expect(roomRepositoryMock.setRoom).not.toHaveBeenCalled();
      expect(roomRepositoryMock.setRound).not.toHaveBeenCalled();
    });

    it('should throw an error if gold value is not available', async () => {
      const modifiedRound = {
        ...mockRound,
        goldList: [1, 3]
      };
      roomRepositoryMock.getRound = jest.fn().mockResolvedValue(modifiedRound);

      await expect(chooseGoldUseCases.execute(mockCode, userSocket, 2))
        .rejects.toThrow('error.NOT_CHOOSE_GOLD');
      
      expect(translationServiceMock.translate).toHaveBeenCalledWith('error.NOT_CHOOSE_GOLD');
      expect(roomRepositoryMock.setRoom).not.toHaveBeenCalled();
      expect(roomRepositoryMock.setRound).not.toHaveBeenCalled();
    });
  });
});
