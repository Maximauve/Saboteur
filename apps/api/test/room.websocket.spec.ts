import { Test, TestingModule } from '@nestjs/testing';
import { Socket } from 'socket.io';
import { RoomWebsocketGateway } from '@/infrastructure/websockets/room.websocket';
import { UsecasesProxyModule } from '@/infrastructure/usecases-proxy/usecases-proxy.module';
import { RedisService } from '@/infrastructure/services/redis/service/redis.service';
import { TranslationService } from '@/infrastructure/services/translation/translation.service';
import { WebsocketEvent } from '@/domain/model/websocket';
import { UseCaseProxy } from '@/infrastructure/usecases-proxy/usecases-proxy';
import { AddUserToRoomUseCases } from '@/usecases/room/addUserToRoom.usecases';
import { IsHostUseCases } from '@/usecases/room/isHost.usecases';
import { RemoveUserFromRoomUseCases } from '@/usecases/room/removeUserFromRoom.usecases';
import { GameIsStartedUseCases } from '@/usecases/room/gameIsStarted.usecases';
import { GetRoomUsersUseCases } from '@/usecases/room/getRoomUsers.usecases';
import { GetSocketIdUseCases } from '@/usecases/room/getSocketId.usecases';
import { StartGameUseCases } from '@/usecases/game/startGame.usecases';
import { GetBoardUseCases } from '@/usecases/game/getBoard.usecases';
import { NewRoundUseCases } from '@/usecases/game/newRound.usecases';
import { GetCurrentRoundUserUseCases } from '@/usecases/room/getCurrentRoundUser.usecases';
import { UserSocket, UserGame } from '@/domain/model/user';
import { Move } from '@/domain/model/move';
import { Card } from '@/domain/model/card';
import { NextUserUseCases } from '@/usecases/game/nextUser.usecases';
import { AttackPlayerUseCases } from '@/usecases/game/attackPlayer.usecases';
import { CanUserPlayUseCases } from '@/usecases/game/canUserPlay.usecases';
import { DestroyCardUseCases } from '@/usecases/game/destroyCard.usecases';
import { DiscardCardUseCases } from '@/usecases/game/discardCard.usecases';
import { DrawCardUseCases } from '@/usecases/game/drawCard.usecases';
import { PlaceCardUseCases } from '@/usecases/game/placeCard.usecases';
import { RepairlayerUseCases } from '@/usecases/game/repairPlayer.usecases';
import { RevealObjectiveUseCases } from '@/usecases/game/revealObjective.usecases';
import { GetDeckLengthUseCases } from '@/usecases/game/getDeckLength.usecases';
import { GetRoundUseCases } from '@/usecases/game/getRound.usecases';
import { IsSaboteurWinUseCases } from '@/usecases/game/isSaboteurWin.usecases';
import { IsNainWinUseCases } from '@/usecases/game/isNainWin.usecases';
import { GoldPhaseUseCases } from '@/usecases/game/goldPhase.usecases';
import { ChooseGoldUseCases } from '@/usecases/game/chooseGold.usecases';
import { GetCardsToRevealUseCases } from '@/usecases/game/getCardsToReveal.usecases';
import { GetUserChooseGoldUseCases } from '@/usecases/game/getUserChooseGold.usecases';
import { GetRoomMessagesUseCases } from '@/usecases/room/getRoomMessages.usecases';
import { AddRoomMessageUseCases } from '@/usecases/room/addRoomMessage.usecases';

describe('RoomWebsocketGateway', () => {
  let gateway: RoomWebsocketGateway;
  let mockRedisService: Partial<RedisService>;
  let mockTranslationService: Partial<TranslationService>;
  let mockSocket: Partial<Socket>;
  let mockServer: any;
  
  // Original use cases
  let mockAddUserToRoomUseCase: Partial<UseCaseProxy<AddUserToRoomUseCases>>;
  let mockIsHostUseCase: Partial<UseCaseProxy<IsHostUseCases>>;
  let mockRemoveUserFromRoomUseCase: Partial<UseCaseProxy<RemoveUserFromRoomUseCases>>;
  let mockGameIsStartedUseCase: Partial<UseCaseProxy<GameIsStartedUseCases>>;
  let mockGetRoomUsersUseCase: Partial<UseCaseProxy<GetRoomUsersUseCases>>;
  let mockGetSocketIdUseCase: Partial<UseCaseProxy<GetSocketIdUseCases>>;
  let mockStartGameUseCases: Partial<UseCaseProxy<StartGameUseCases>>;
  let mockGetBoardUseCases: Partial<UseCaseProxy<GetBoardUseCases>>;
  let mockNewsRoundUseCases: Partial<UseCaseProxy<NewRoundUseCases>>;
  let mockGetCurrentRoundUserUseCases: Partial<UseCaseProxy<GetCurrentRoundUserUseCases>>;
  
  // Additional use cases
  let mockNextPlayerUseCases: Partial<UseCaseProxy<NextUserUseCases>>;
  let mockAttackPlayerUseCases: Partial<UseCaseProxy<AttackPlayerUseCases>>;
  let mockCanUserPlayUseCases: Partial<UseCaseProxy<CanUserPlayUseCases>>;
  let mockDestroyCardUseCases: Partial<UseCaseProxy<DestroyCardUseCases>>;
  let mockDiscardCardUseCases: Partial<UseCaseProxy<DiscardCardUseCases>>;
  let mockDrawCardUseCases: Partial<UseCaseProxy<DrawCardUseCases>>;
  let mockPlaceCardUseCases: Partial<UseCaseProxy<PlaceCardUseCases>>;
  let mockRepairPlayerUseCases: Partial<UseCaseProxy<RepairlayerUseCases>>;
  let mockRevealObjectiveUseCases: Partial<UseCaseProxy<RevealObjectiveUseCases>>;
  let mockGetDeckLengthUseCases: Partial<UseCaseProxy<GetDeckLengthUseCases>>;
  let mockGetRoundUseCases: Partial<UseCaseProxy<GetRoundUseCases>>;
  let mockIsSaboteurWinUseCases: Partial<UseCaseProxy<IsSaboteurWinUseCases>>;
  let mockIsNainWinUseCases: Partial<UseCaseProxy<IsNainWinUseCases>>;
  let mockGoldPhaseUseCases: Partial<UseCaseProxy<GoldPhaseUseCases>>;
  let mockChooseGoldUseCases: Partial<UseCaseProxy<ChooseGoldUseCases>>;
  let mockGetCardsToRevealUseCases: Partial<UseCaseProxy<GetCardsToRevealUseCases>>;
  let mockGetUserChooseGoldUseCases: Partial<UseCaseProxy<GetUserChooseGoldUseCases>>;
  let mockGetRoomMessagesUseCases: Partial<UseCaseProxy<GetRoomMessagesUseCases>>;
  let mockAddRoomMessageUseCases: Partial<UseCaseProxy<AddRoomMessageUseCases>>;
  
  const mockRoomCode = 'ABC123';
  const mockUser: UserSocket = {
    socketId: 'socket-id',
    userId: 'user-id',
    username: 'testuser',
    gold: 0,
    ready: false,
    isHost: true
  };
  
  const mockUsers = [mockUser, { ...mockUser, socketId: 'socket-id-2', userId: 'user-id-2', username: 'user2', isHost: false }];
  const mockMessages = [{ text: 'Hello', username: 'testuser', userId: 'user-id', timeSent: '2023-01-01' }];
  
  beforeEach(async () => {
    // Create mocks for original use cases
    mockAddUserToRoomUseCase = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(undefined)
      })
    };
    
    mockIsHostUseCase = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(true)
      })
    };
    
    mockRemoveUserFromRoomUseCase = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(undefined)
      })
    };
    
    mockGameIsStartedUseCase = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(false)
      })
    };
    
    mockGetRoomUsersUseCase = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(mockUsers)
      })
    };
    
    mockGetSocketIdUseCase = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue('socket-id-2')
      })
    };
    
    mockStartGameUseCases = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(undefined)
      })
    };
    
    mockGetBoardUseCases = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue({ board: 'mock-board' })
      })
    };
    
    mockNewsRoundUseCases = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(mockUsers.map(user => ({ ...user, cards: ['card1', 'card2'] })))
      })
    };
    
    mockGetCurrentRoundUserUseCases = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue({ ...mockUser, cards: ['card1', 'card2'] })
      })
    };
    
    // Create mocks for additional use cases
    mockNextPlayerUseCases = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(undefined)
      })
    };
    
    mockAttackPlayerUseCases = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(undefined)
      })
    };
    
    mockCanUserPlayUseCases = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(true)
      })
    };
    
    mockDestroyCardUseCases = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(undefined)
      })
    };
    
    mockDiscardCardUseCases = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(undefined)
      })
    };
    
    mockDrawCardUseCases = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(['card1', 'card2'])
      })
    };
    
    mockPlaceCardUseCases = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(undefined)
      })
    };
    
    mockRepairPlayerUseCases = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(undefined)
      })
    };
    
    mockRevealObjectiveUseCases = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(undefined)
      })
    };
    
    mockGetDeckLengthUseCases = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(40)
      })
    };
    
    mockGetRoundUseCases = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(1)
      })
    };
    
    mockIsSaboteurWinUseCases = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(false)
      })
    };
    
    mockIsNainWinUseCases = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(false)
      })
    };
    
    mockGoldPhaseUseCases = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(undefined)
      })
    };
    
    mockChooseGoldUseCases = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(undefined)
      })
    };
    
    mockGetCardsToRevealUseCases = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue([{ id: 'card1' }])
      })
    };
    
    mockGetUserChooseGoldUseCases = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(mockUsers)
      })
    };
    
    mockGetRoomMessagesUseCases = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(mockMessages)
      })
    };
    
    mockAddRoomMessageUseCases = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(undefined)
      })
    };
    
    mockRedisService = {
      exists: jest.fn().mockResolvedValue(true)
    };
    
    mockTranslationService = {
      translate: jest.fn().mockImplementation((key) => Promise.resolve(key))
    };
    
    mockSocket = {
      id: 'socket-id',
      join: jest.fn(),
      data: {
        user: mockUser,
        code: mockRoomCode
      },
      handshake: {
        auth: {},
        headers: {},
        time: '',
        address: '',
        xdomain: false,
        secure: false,
        issued: 0,
        url: '',
        query: {
          userId: 'user-id',
          username: 'testuser',
          code: mockRoomCode
        }
      }
    };
    
    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn()
    };
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomWebsocketGateway,
        {
          provide: UsecasesProxyModule.ADD_USER_TO_ROOM_USECASES_PROXY,
          useValue: mockAddUserToRoomUseCase
        },
        {
          provide: UsecasesProxyModule.IS_HOST_USECASES_PROXY,
          useValue: mockIsHostUseCase
        },
        {
          provide: UsecasesProxyModule.REMOVE_USER_FROM_ROOM_USECASES_PROXY,
          useValue: mockRemoveUserFromRoomUseCase
        },
        {
          provide: UsecasesProxyModule.GAME_IS_STARTED_USECASES_PROXY,
          useValue: mockGameIsStartedUseCase
        },
        {
          provide: UsecasesProxyModule.GET_ROOM_USERS_USECASES_PROXY,
          useValue: mockGetRoomUsersUseCase
        },
        {
          provide: UsecasesProxyModule.GET_SOCKET_ID_USECASES_PROXY,
          useValue: mockGetSocketIdUseCase
        },
        {
          provide: UsecasesProxyModule.START_GAME_USECASES_PROXY,
          useValue: mockStartGameUseCases
        },
        {
          provide: UsecasesProxyModule.GET_BOARD_USECASES_PROXY,
          useValue: mockGetBoardUseCases
        },
        {
          provide: UsecasesProxyModule.NEW_ROUND_USECASES_PROXY,
          useValue: mockNewsRoundUseCases
        },
        {
          provide: UsecasesProxyModule.GET_CURRENT_ROUND_USER,
          useValue: mockGetCurrentRoundUserUseCases
        },
        {
          provide: UsecasesProxyModule.NEXT_USER_USECASES_PROXY,
          useValue: mockNextPlayerUseCases
        },
        {
          provide: UsecasesProxyModule.ATTACK_PLAYER_USECASES_PROXY,
          useValue: mockAttackPlayerUseCases
        },
        {
          provide: UsecasesProxyModule.CAN_USER_PLAY_USECASES_PROXY,
          useValue: mockCanUserPlayUseCases
        },
        {
          provide: UsecasesProxyModule.DESTROY_CARD_USECASES_PROXY,
          useValue: mockDestroyCardUseCases
        },
        {
          provide: UsecasesProxyModule.DISCARD_CARD_USECASES_PROXY,
          useValue: mockDiscardCardUseCases
        },
        {
          provide: UsecasesProxyModule.DRAW_CARD_USECASES_PROXY,
          useValue: mockDrawCardUseCases
        },
        {
          provide: UsecasesProxyModule.PLACE_CARD_USECASES_PROXY,
          useValue: mockPlaceCardUseCases
        },
        {
          provide: UsecasesProxyModule.REPAIR_PLAYER_USECASES_PROXY,
          useValue: mockRepairPlayerUseCases
        },
        {
          provide: UsecasesProxyModule.REVEAL_OBJECTIVE_CARD_USECASES_PROXY,
          useValue: mockRevealObjectiveUseCases
        },
        {
          provide: UsecasesProxyModule.GET_DECK_LENGTH_USECASES_PROXY,
          useValue: mockGetDeckLengthUseCases
        },
        {
          provide: UsecasesProxyModule.GET_ROUND_USECASES_PROXY,
          useValue: mockGetRoundUseCases
        },
        {
          provide: UsecasesProxyModule.IS_SABOTEUR_WIN_USECASES_PROXY,
          useValue: mockIsSaboteurWinUseCases
        },
        {
          provide: UsecasesProxyModule.IS_NAIN_WIN_USECASES_PROXY,
          useValue: mockIsNainWinUseCases
        },
        {
          provide: UsecasesProxyModule.GOLD_PHASE_USECASES_PROXY,
          useValue: mockGoldPhaseUseCases
        },
        {
          provide: UsecasesProxyModule.CHOOSE_GOLD_USECASES_PROXY,
          useValue: mockChooseGoldUseCases
        },
        {
          provide: UsecasesProxyModule.GET_CARDS_TO_REVEAL_USECASES_PROXY,
          useValue: mockGetCardsToRevealUseCases
        },
        {
          provide: UsecasesProxyModule.GET_USER_CHOOSE_GOLD_USECASES_PROXY,
          useValue: mockGetUserChooseGoldUseCases
        },
        {
          provide: UsecasesProxyModule.GET_ROOM_MESSAGES_USECASES_PROXY,
          useValue: mockGetRoomMessagesUseCases
        },
        {
          provide: UsecasesProxyModule.ADD_ROOM_MESSAGE_USECASES_PROXY,
          useValue: mockAddRoomMessageUseCases
        },
        {
          provide: RedisService,
          useValue: mockRedisService
        },
        {
          provide: TranslationService,
          useValue: mockTranslationService
        }
      ]
    }).compile();
    
    gateway = module.get<RoomWebsocketGateway>(RoomWebsocketGateway);
    gateway.server = mockServer;
  });
  
  describe('handleConnection', () => {
    it('should set socket data', () => {
      const socket = {
        id: 'socket-id',
        data: {},
        handshake: {
          query: {
            userId: 'user-id',
            username: 'testuser',
            code: mockRoomCode
          }
        }
      } as unknown as Socket;
      
      gateway.handleConnection(socket);
      
      expect(socket.data.user).toEqual({
        socketId: 'socket-id',
        userId: 'user-id',
        username: 'testuser',
        gold: 0,
        ready: false,
        isHost: false
      });
      expect(socket.data.code).toEqual(mockRoomCode);
    });
  });
  
  describe('joinRoom', () => {
    it('should add user to room and emit members', async () => {
      const result = await gateway.joinRoom(mockSocket as Socket);
      
      expect(mockAddUserToRoomUseCase?.getInstance && mockAddUserToRoomUseCase.getInstance().execute).toHaveBeenCalledWith(mockRoomCode, mockUser);
      expect(mockSocket.join).toHaveBeenCalledWith(mockRoomCode);
      expect(mockGetRoomUsersUseCase.getInstance && mockGetRoomUsersUseCase.getInstance().execute).toHaveBeenCalledWith(mockRoomCode);
      expect(mockGameIsStartedUseCase?.getInstance && mockGameIsStartedUseCase?.getInstance()?.execute).toHaveBeenCalledWith(mockRoomCode);
      expect(mockGetRoomMessagesUseCases.getInstance && mockGetRoomMessagesUseCases.getInstance().execute).toHaveBeenCalledWith(mockRoomCode);
      expect(mockServer.to).toHaveBeenCalledWith(mockRoomCode);
      expect(mockServer.emit).toHaveBeenCalledWith(WebsocketEvent.MEMBERS, mockUsers);
      expect(mockServer.emit).toHaveBeenCalledWith(WebsocketEvent.CHAT, mockMessages);
      expect(result).toEqual({ gameIsStarted: false });
    });
    
    it('should send game data if game is already started', async () => {
      mockGameIsStartedUseCase.getInstance = jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(true)
      });
      
      await gateway.joinRoom(mockSocket as Socket);
      
      expect(mockAddUserToRoomUseCase.getInstance && mockAddUserToRoomUseCase.getInstance().execute).toHaveBeenCalledWith(mockRoomCode, mockUser);
      expect(mockSocket.join).toHaveBeenCalledWith(mockRoomCode);
      expect(mockGameIsStartedUseCase.getInstance().execute).toHaveBeenCalledWith(mockRoomCode);
      expect(mockGetCurrentRoundUserUseCases.getInstance && mockGetCurrentRoundUserUseCases.getInstance().execute).toHaveBeenCalledWith(mockRoomCode, mockUser.userId);
      
      // Check that the right events are emitted to the socket
      expect(mockServer.to).toHaveBeenCalledWith(mockUser.socketId);
      expect(mockServer.emit).toHaveBeenCalledWith(WebsocketEvent.GAME_IS_STARTED, true);
      expect(mockServer.emit).toHaveBeenCalledWith(WebsocketEvent.BOARD, { board: 'mock-board' });
      expect(mockServer.emit).toHaveBeenCalledWith(WebsocketEvent.USER, { ...mockUser, cards: ['card1', 'card2'] });
    });
    
    it('should handle room not found error', async () => {
      mockRedisService.exists = jest.fn().mockResolvedValue(false);
      
      const result = await gateway.joinRoom(mockSocket as Socket);
      
      expect(result).toEqual({ error: 'error.ROOM_NOT_FOUND' });
    });
  });
  
  describe('leaveRoom', () => {
    it('should remove user from room and emit members', async () => {
      await gateway.leaveRoom(mockSocket as Socket);
      
      expect(mockRemoveUserFromRoomUseCase.getInstance && mockRemoveUserFromRoomUseCase.getInstance().execute).toHaveBeenCalledWith(mockRoomCode, mockUser);
      expect(mockGetRoomUsersUseCase.getInstance && mockGetRoomUsersUseCase.getInstance().execute).toHaveBeenCalledWith(mockRoomCode);
      expect(mockServer.to).toHaveBeenCalledWith(mockRoomCode);
      expect(mockServer.emit).toHaveBeenCalledWith(WebsocketEvent.MEMBERS, mockUsers);
    });
  });
  
  describe('chat', () => {
    it('should add message to room and emit chat message', async () => {
      const message = { text: 'Hello room!', timeSent: new Date().toString() };
      
      await gateway.chat(mockSocket as Socket, message);
      
      // Check that addRoomMessageUseCases was called with the correct message
      const expectedMessage = { 
        ...message, 
        username: mockUser.username, 
        userId: mockUser.userId 
      };
      
      expect(mockAddRoomMessageUseCases.getInstance && mockAddRoomMessageUseCases.getInstance().execute)
        .toHaveBeenCalledWith(mockRoomCode, expectedMessage);
      
      expect(mockServer.to).toHaveBeenCalledWith(mockRoomCode);
      expect(mockServer.emit).toHaveBeenCalledWith(WebsocketEvent.CHAT, expectedMessage);
    });
  });
  
  describe('kickUser', () => {
    it('should kick user if current user is host', async () => {
      const userToKick = { ...mockUser, socketId: 'socket-id-2', userId: 'user-id-2', username: 'user2' };
      
      await gateway.kickUser(mockSocket as Socket, userToKick);
      
      expect(mockIsHostUseCase.getInstance && mockIsHostUseCase.getInstance().execute).toHaveBeenCalledWith(mockRoomCode, mockUser);
      expect(mockGetSocketIdUseCase.getInstance && mockGetSocketIdUseCase.getInstance().execute).toHaveBeenCalledWith(mockRoomCode, 'user-id-2');
      expect(mockServer.to).toHaveBeenCalledWith('socket-id-2');
      expect(mockServer.emit).toHaveBeenCalledWith(WebsocketEvent.REMOVE_USER);
      expect(mockRemoveUserFromRoomUseCase.getInstance && mockRemoveUserFromRoomUseCase.getInstance().execute).toHaveBeenCalledWith(mockRoomCode, mockUser);
      expect(mockGetRoomUsersUseCase.getInstance && mockGetRoomUsersUseCase.getInstance().execute).toHaveBeenCalledWith(mockRoomCode);
      expect(mockServer.to).toHaveBeenCalledWith(mockRoomCode);
      expect(mockServer.emit).toHaveBeenCalledWith(WebsocketEvent.MEMBERS, mockUsers);
    });
    
    it('should throw error if current user is not host', async () => {
      mockIsHostUseCase.getInstance = jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(false)
      });
      
      const userToKick = { ...mockUser, socketId: 'socket-id-2', userId: 'user-id-2', username: 'user2' };
      const result = await gateway.kickUser(mockSocket as Socket, userToKick);
      
      expect(result).toEqual({ error: 'error.NOT_HOST' });
      expect(mockIsHostUseCase.getInstance().execute).toHaveBeenCalledWith(mockRoomCode, mockUser);
      expect(mockRemoveUserFromRoomUseCase.getInstance && mockRemoveUserFromRoomUseCase.getInstance().execute).not.toHaveBeenCalled();
    });
  });
  
  describe('startGame', () => {
    it('should start game if current user is host', async () => {
      await gateway.startGame(mockSocket as Socket);
      
      expect(mockIsHostUseCase.getInstance && mockIsHostUseCase.getInstance().execute).toHaveBeenCalledWith(mockRoomCode, mockUser);
      expect(mockStartGameUseCases.getInstance && mockStartGameUseCases.getInstance().execute).toHaveBeenCalledWith(mockRoomCode, mockUser);
      expect(mockNewsRoundUseCases.getInstance && mockNewsRoundUseCases.getInstance().execute).toHaveBeenCalledWith(mockRoomCode);
      expect(mockGetDeckLengthUseCases.getInstance && mockGetDeckLengthUseCases.getInstance().execute).toHaveBeenCalledWith(mockRoomCode);
      expect(mockGetBoardUseCases.getInstance && mockGetBoardUseCases.getInstance().execute).toHaveBeenCalledWith(mockRoomCode);
      expect(mockGetRoomUsersUseCase.getInstance && mockGetRoomUsersUseCase.getInstance().execute).toHaveBeenCalledWith(mockRoomCode);
      
      // Verify that events are emitted to all clients in the room
      expect(mockServer.to).toHaveBeenCalledWith(mockRoomCode);
      expect(mockServer.emit).toHaveBeenCalledWith(WebsocketEvent.DECK, 40);
      expect(mockServer.emit).toHaveBeenCalledWith(WebsocketEvent.BOARD, { board: 'mock-board' });
      expect(mockServer.emit).toHaveBeenCalledWith(WebsocketEvent.MEMBERS, mockUsers);
      expect(mockServer.emit).toHaveBeenCalledWith(WebsocketEvent.GAME_IS_STARTED, true);
      expect(mockServer.emit).toHaveBeenCalledWith(WebsocketEvent.SHOW_ROLE);
    });
    
    it('should throw error if current user is not host', async () => {
      mockIsHostUseCase.getInstance = jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(false)
      });
      
      const result = await gateway.startGame(mockSocket as Socket);
      
      expect(result).toEqual({ error: 'error.NOT_HOST' });
      expect(mockIsHostUseCase.getInstance().execute).toHaveBeenCalledWith(mockRoomCode, mockUser);
      expect(mockStartGameUseCases.getInstance && mockStartGameUseCases.getInstance().execute).not.toHaveBeenCalled();
    });
  });
})
