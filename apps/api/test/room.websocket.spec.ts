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
import { GetCurrentRoundUserUseCases } from '@/usecases/room/getCurrentRoundUserUseCases.usecases';
import { UserSocket, UserGame } from '@/domain/model/user';
import { Move } from '@/domain/model/move';
import { Card } from '@/domain/model/card';

describe('RoomWebsocketGateway', () => {
  let gateway: RoomWebsocketGateway;
  let mockRedisService: Partial<RedisService>;
  let mockTranslationService: Partial<TranslationService>;
  let mockSocket: Partial<Socket>;
  let mockServer: any;
  
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
  
  beforeEach(async () => {
    // Create mocks for all use cases
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
      expect(mockGameIsStartedUseCase?.getInstance && mockGameIsStartedUseCase?.getInstance()?.execute).toHaveBeenCalledWith(mockRoomCode);
      expect(mockServer.emit).toHaveBeenCalledWith(WebsocketEvent.MEMBERS, mockUsers);
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
      
      // Check that the right events are emitted to the socket
      expect(mockServer.to).toHaveBeenCalledWith(mockUser.socketId);
      expect(mockServer.emit).toHaveBeenNthCalledWith(1, WebsocketEvent.GAME_IS_STARTED, true);
      expect(mockServer.emit).toHaveBeenNthCalledWith(2, WebsocketEvent.BOARD, { board: 'mock-board' });
      expect(mockServer.emit).toHaveBeenNthCalledWith(3, WebsocketEvent.CARDS, ['card1', 'card2']);
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
      expect(mockServer.emit).toHaveBeenCalledWith(WebsocketEvent.MEMBERS, mockUsers);
    });
  });
  
  describe('chat', () => {
    it('should emit chat message to room', () => {
      const message = { text: 'Hello room!', timeSent: new Date().toString() };
      
      gateway.chat(mockSocket as Socket, message);
      
      expect(mockServer.emit).toHaveBeenCalledWith(WebsocketEvent.CHAT, message, mockUser);
    });
  });
  
  describe('kickUser', () => {
    it('should kick user if current user is host', async () => {
      const userToKick = { ...mockUser, socketId: 'socket-id-2', userId: 'user-id-2', username: 'user2' };
      
      await gateway.kickUser(mockSocket as Socket, userToKick);
      
      expect(mockIsHostUseCase.getInstance && mockIsHostUseCase.getInstance().execute).toHaveBeenCalledWith(mockRoomCode, mockUser);
      expect(mockGetSocketIdUseCase.getInstance && mockGetSocketIdUseCase.getInstance().execute).toHaveBeenCalledWith(mockRoomCode, 'user-id-2');
      expect(mockServer.emit).toHaveBeenCalledWith(WebsocketEvent.REMOVE_USER);
      expect(mockRemoveUserFromRoomUseCase.getInstance && mockRemoveUserFromRoomUseCase.getInstance().execute).toHaveBeenCalledWith(mockRoomCode, mockUser);
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
      
      expect(mockGetSocketIdUseCase.getInstance && mockGetSocketIdUseCase.getInstance().execute).toHaveBeenCalledTimes(2);
      expect(mockServer.emit).toHaveBeenCalledWith(WebsocketEvent.CARDS, ['card1', 'card2']);
      
      expect(mockServer.emit).toHaveBeenCalledWith(WebsocketEvent.BOARD, { board: 'mock-board' });
      expect(mockServer.emit).toHaveBeenCalledWith(WebsocketEvent.MEMBERS, mockUsers);
      expect(mockServer.emit).toHaveBeenCalledWith(WebsocketEvent.GAME_IS_STARTED, true);
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
  
  describe('play', () => {
    it('should process player move and update game state', async () => {
      const move: Move = { x: 1, y: 2, card: {} as Card };
      
      await gateway.play(mockSocket as Socket, move);
      
      expect(mockGetCurrentRoundUserUseCases.getInstance && mockGetCurrentRoundUserUseCases.getInstance().execute).toHaveBeenCalledWith(mockRoomCode, mockUser.userId);
      expect(mockServer.emit).toHaveBeenCalledWith(WebsocketEvent.CARDS, ['card1', 'card2']);
      expect(mockServer.emit).toHaveBeenCalledWith(WebsocketEvent.BOARD, { board: 'mock-board' });
      expect(mockServer.emit).toHaveBeenCalledWith(WebsocketEvent.MEMBERS, mockUsers);
    });
  });
  
  describe('handleAction', () => {
    it('should execute callback if room exists', async () => {
      const callback = jest.fn().mockResolvedValue({ success: true });
      
      const result = await gateway.handleAction(mockRoomCode, callback);
      
      expect(mockRedisService.exists).toHaveBeenCalledWith(`room:${mockRoomCode}`);
      expect(callback).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
    
    it('should return error if room does not exist', async () => {
      mockRedisService.exists = jest.fn().mockResolvedValue(false);
      const callback = jest.fn();
      
      const result = await gateway.handleAction(mockRoomCode, callback);
      
      expect(mockRedisService.exists).toHaveBeenCalledWith(`room:${mockRoomCode}`);
      expect(callback).not.toHaveBeenCalled();
      expect(result).toEqual({ error: 'error.ROOM_NOT_FOUND' });
    });
    
    it('should return error if callback throws', async () => {
      const callback = jest.fn().mockRejectedValue(new Error('Custom error'));
      
      const result = await gateway.handleAction(mockRoomCode, callback);
      
      expect(mockRedisService.exists).toHaveBeenCalledWith(`room:${mockRoomCode}`);
      expect(callback).toHaveBeenCalled();
      expect(result).toEqual({ error: 'Custom error' });
    });
  });
});
