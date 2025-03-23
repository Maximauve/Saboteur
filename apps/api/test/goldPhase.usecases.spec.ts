import { Test } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { Round } from '@/domain/model/round';
import { Room } from '@/domain/model/room';
import { Board } from '@/domain/model/board';
import { Card } from '@/domain/model/card';
import { UserSocket, UserGame, UserRoom } from '@/domain/model/user';
import { RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { TranslationService } from '@/infrastructure/services/translation/translation.service';
import { GoldPhaseUseCases } from '@/usecases/game/goldPhase.usecases';

describe('GoldPhaseUseCases', () => {
  let goldPhaseUseCases: GoldPhaseUseCases;
  let loggerMock: ILogger;
  let roomRepositoryMock: RoomRepository;
  let translationServiceMock: TranslationService;

  const mockCode = 'TEST123';

  const mockUserSocket: UserSocket = {
    userId: 'user1',
    socketId: 'socket1',
    ready: false,
    gold: 0,
    username: '',
    isHost: false
  };

  const saboteurUser: UserGame = {
    userId: 'saboteur1',
    username: 'Saboteur 1',
    isSaboteur: true,
    cards: [],
    cardsRevealed: [],
    malus: [],
    hasToPlay: false,
    hasToChooseGold: false,
    socketId: '',
    ready: false,
    gold: 0,
    isHost: false
  };

  const dwarfUser1: UserGame = {
    userId: 'user1',
    username: 'Dwarf 1',
    isSaboteur: false,
    cards: [],
    cardsRevealed: [],
    malus: [],
    hasToPlay: false,
    hasToChooseGold: false,
    socketId: '',
    ready: false,
    gold: 0,
    isHost: false
  };

  const dwarfUser2: UserGame = {
    userId: 'user2',
    username: 'Dwarf 2',
    isSaboteur: false,
    cards: [],
    cardsRevealed: [],
    malus: [],
    hasToPlay: false,
    hasToChooseGold: false,
    socketId: '',
    ready: false,
    gold: 0,
    isHost: false
  };

  const mockBoard: Board = {
    grid: [],
    startCard: {} as Card,
    objectivePositions: []
  };

  const mockRoom: Room = {
    code: mockCode,
    goldDeck: [3, 2, 1, 4, 5, 6, 7, 8, 9, 10],
    users: [
      { userId: 'user1', gold: 0 },
      { userId: 'user2', gold: 0 },
      { userId: 'saboteur1', gold: 0 }
    ] as UserSocket[],
    started: true,
    host: new UserRoom,
    currentRound: 0,
    messages: []
  };

  const mockRound: Round = {
    index: 1,
    board: mockBoard,
    users: [dwarfUser1, dwarfUser2, saboteurUser],
    deck: [],
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
      getRound: jest.fn().mockResolvedValue({...mockRound}),
      getRoom: jest.fn().mockResolvedValue({...mockRoom}),
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

    goldPhaseUseCases = new GoldPhaseUseCases(
      loggerMock,
      roomRepositoryMock,
      translationServiceMock
    );
  });

  describe('execute', () => {
    it('should distribute gold to saboteurs when isSaboteurWin is true', async () => {
      const isSaboteurWin = true;
      
      const result = await goldPhaseUseCases.execute(mockCode, mockUserSocket, isSaboteurWin);
      
      expect(roomRepositoryMock.getRoom).toHaveBeenCalledWith(mockCode);
      expect(roomRepositoryMock.getRound).toHaveBeenCalledWith(mockCode);
      
      expect(roomRepositoryMock.setRoom).toHaveBeenCalled();
      const setRoomArgs = (roomRepositoryMock.setRoom as jest.Mock).mock.calls[0];
      expect(setRoomArgs[0]).toBe(mockCode);
      
      const updatedRoomUsers = JSON.parse(setRoomArgs[1][3]);
      
      const saboteurRoomUser = updatedRoomUsers.find((u: UserSocket) => u.userId === 'saboteur1');
      expect(saboteurRoomUser.gold).toBe(4);
      
      expect(result).toEqual([]);
    });

    it('should distribute gold cards to dwarfs when isSaboteurWin is false', async () => {
      const isSaboteurWin = false;
      
      const result = await goldPhaseUseCases.execute(mockCode, mockUserSocket, isSaboteurWin);
      
      expect(result).toEqual([3, 2, 1]);
      
      expect(roomRepositoryMock.setRoom).toHaveBeenCalled();
      
      expect(roomRepositoryMock.setRound).toHaveBeenCalled();
      const setRoundArgs = (roomRepositoryMock.setRound as jest.Mock).mock.calls[0];
      expect(setRoundArgs[0]).toBe(mockCode);
      expect(setRoundArgs[1]).toBe(1);
      
      const updatedGoldList = JSON.parse(setRoundArgs[2][1]);
      const updatedRoundUsers = JSON.parse(setRoundArgs[2][3]);
      
      expect(updatedGoldList).toEqual([3, 2, 1]);
      
      const firstDwarf = updatedRoundUsers.find((u: UserGame) => u.userId === 'user1');
      expect(firstDwarf.hasToChooseGold).toBe(true);
    });

    it('should throw an error if user not found in round', async () => {
      const unknownUser: UserSocket = {
        userId: 'unknown',
        socketId: 'socket-unknown',
        ready: false,
        gold: 0,
        username: '',
        isHost: false
      };
      
      await expect(goldPhaseUseCases.execute(mockCode, unknownUser, false))
        .rejects.toThrow('error.USER_NOT_FOUND');
    });

    it('should throw an error if not enough gold in deck', async () => {
      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue({
        ...mockRoom,
        goldDeck: [1]
      });
      
      await expect(goldPhaseUseCases.execute(mockCode, mockUserSocket, false))
        .rejects.toThrow('error.NOT_ENOUGH_GOLD');
    });

    it('should give appropriate gold amount to saboteurs based on their count', async () => {
      const twoSaboteursRound = {
        ...mockRound,
        users: [
          dwarfUser1,
          { ...saboteurUser, userId: 'saboteur1' },
          { ...saboteurUser, userId: 'saboteur2' }
        ]
      };
      
      const twoSaboteursRoom = {
        ...mockRoom,
        users: [
          { userId: 'user1', gold: 0 },
          { userId: 'saboteur1', gold: 0 },
          { userId: 'saboteur2', gold: 0 }
        ]
      };
      
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(twoSaboteursRound);
      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(twoSaboteursRoom);
      
      await goldPhaseUseCases.execute(mockCode, mockUserSocket, true);
      
      const setRoomArgs = (roomRepositoryMock.setRoom as jest.Mock).mock.calls[0];
      const updatedRoomUsers = JSON.parse(setRoomArgs[1][3]);
      
      const saboteur1 = updatedRoomUsers.find((u: UserSocket) => u.userId === 'saboteur1');
      const saboteur2 = updatedRoomUsers.find((u: UserSocket) => u.userId === 'saboteur2');
      expect(saboteur1.gold).toBe(3);
      expect(saboteur2.gold).toBe(3);
    });

    it('should handle case when user is saboteur and need to find first dwarf', async () => {
      const saboteurUserSocket: UserSocket = {
        userId: 'saboteur1',
        socketId: 'socket-saboteur',
        ready: false,
        gold: 0,
        username: '',
        isHost: false
      };
      
      await goldPhaseUseCases.execute(mockCode, saboteurUserSocket, false);
      
      const setRoundArgs = (roomRepositoryMock.setRound as jest.Mock).mock.calls[0];
      const updatedRoundUsers = JSON.parse(setRoundArgs[2][3]);
      
      const firstDwarf = updatedRoundUsers.find((u: UserGame) => u.userId === 'user2');
      expect(firstDwarf.hasToChooseGold).toBe(true);
    });

    it('should throw an error when no dwarf is found for gold selection', async () => {
      const allSaboteursRound = {
        ...mockRound,
        users: [
          { ...saboteurUser, userId: 'saboteur1' },
          { ...saboteurUser, userId: 'saboteur2' },
          { ...saboteurUser, userId: 'saboteur3' }
        ]
      };
      
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(allSaboteursRound);
      
      await expect(goldPhaseUseCases.execute(mockCode, { ...mockUserSocket, userId: 'saboteur1' }, false))
        .rejects.toThrow('error.USER_NOT_FOUND');
    });

    it('should initialize goldList if it is undefined', async () => {
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue({
        ...mockRound,
        goldList: undefined
      });
      
      await goldPhaseUseCases.execute(mockCode, mockUserSocket, true);
      
      const setRoundArgs = (roomRepositoryMock.setRound as jest.Mock).mock.calls[0];
      const updatedGoldList = JSON.parse(setRoundArgs[2][1]);
      expect(updatedGoldList).toEqual([]);
    });

    it('should handle 4 or more saboteurs giving them 2 gold each', async () => {
      const manySaboteursRound = {
        ...mockRound,
        users: Array(4).fill(null).map((_, i) => ({
          ...saboteurUser,
          userId: `saboteur${i+1}`
        }))
      };
      
      const manySaboteursRoom = {
        ...mockRoom,
        users: Array(4).fill(null).map((_, i) => ({
          userId: `saboteur${i+1}`,
          gold: 0
        }))
      };
      
      (roomRepositoryMock.getRound as jest.Mock).mockResolvedValue(manySaboteursRound);
      (roomRepositoryMock.getRoom as jest.Mock).mockResolvedValue(manySaboteursRoom);
      
      await goldPhaseUseCases.execute(mockCode, { ...mockUserSocket, userId: 'saboteur1' }, true);
      
      const setRoomArgs = (roomRepositoryMock.setRoom as jest.Mock).mock.calls[0];
      const updatedRoomUsers = JSON.parse(setRoomArgs[1][3]);
      
      updatedRoomUsers.forEach((user: UserSocket) => {
        expect(user.gold).toBe(2);
      });
    });
  });
});
