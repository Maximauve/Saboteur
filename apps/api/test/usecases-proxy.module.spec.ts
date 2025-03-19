import { Test, TestingModule } from '@nestjs/testing';
import { UsecasesProxyModule } from '@/infrastructure/usecases-proxy/usecases-proxy.module';
import { LoggerService } from '@/infrastructure/logger/logger.service';
import { TranslationService } from '@/infrastructure/services/translation/translation.service';
import { UseCaseProxy } from '@/infrastructure/usecases-proxy/usecases-proxy';

import { GetUserByIdUseCases } from '@/usecases/user/getUserById.usecases';
import { AddUserUseCases } from '@/usecases/user/addUser.usecases';
import { GetUserByEmailUseCases } from '@/usecases/user/getUserByEmail.usecases';
import { GetUsersUseCases } from '@/usecases/user/getUsers.usecases';
import { UpdateUserUseCases } from '@/usecases/user/updateUser.usecases';
import { DeleteUserByIdUseCases } from '@/usecases/user/deleteUser.usecases';
import { CheckUnknownUserUseCases } from '@/usecases/user/checkUnknownUser.usecases';
import { CreateRoomUseCases } from '@/usecases/room/createRoom.usecases';
import { AddUserToRoomUseCases } from '@/usecases/room/addUserToRoom.usecases';
import { RemoveUserFromRoomUseCases } from '@/usecases/room/removeUserFromRoom.usecases';
import { GameIsStartedUseCases } from '@/usecases/room/gameIsStarted.usecases';
import { GetRoomUsersUseCases } from '@/usecases/room/getRoomUsers.usecases';
import { IsHostUseCases } from '@/usecases/room/isHost.usecases';
import { GetSocketIdUseCases } from '@/usecases/room/getSocketId.usecases';
import { GetRoomUseCases } from '@/usecases/room/getRoom.usecases';
import { StartGameUseCases } from '@/usecases/game/startGame.usecases';
import { GetRoundUseCases } from '@/usecases/game/getRound.usecases';
import { GetBoardUseCases } from '@/usecases/game/getBoard.usecases';
import { GetUserGameUseCases } from '@/usecases/game/getUserGame.usecases';
import { NewRoundUseCases } from '@/usecases/game/newRound.usecases';
import { GetCurrentRoundUserUseCases } from '@/usecases/room/getCurrentRoundUserUseCases.usecases';
import { DatabaseRoomRepository } from '@/infrastructure/repositories/room.repositories';
import { DatabaseUserRepository } from '@/infrastructure/repositories/user.repository';

jest.mock('@/infrastructure/repositories/repositories.module', () => ({
  RepositoriesModule: {
    forwardRef: jest.fn().mockReturnValue('MockedRepositoriesModule'),
  },
}));

jest.mock('@/infrastructure/logger/logger.module', () => ({
  LoggerModule: {},
}));

jest.mock('@/infrastructure/exceptions/exceptions.module', () => ({
  ExceptionsModule: {},
}));

describe('UsecasesProxyModule', () => {
  let moduleRef: TestingModule;
  
  const mockLoggerService = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };
  
  const mockDatabaseUserRepository = {
    getUserById: jest.fn(),
    getUserByEmail: jest.fn(),
    getUsers: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  };
  
  const mockDatabaseRoomRepository = {
    createRoom: jest.fn(),
    addUserToRoom: jest.fn(),
    removeUserFromRoom: jest.fn(),
    getRoom: jest.fn(),
    getRoomUsers: jest.fn(),
    isGameStarted: jest.fn(),
    isHost: jest.fn(),
    getSocketId: jest.fn(),
    getBoard: jest.fn(),
    getRound: jest.fn(),
    nextRound: jest.fn(),
    getCurrentRoundUser: jest.fn(),
  };
  
  const mockTranslationService = {
    translate: jest.fn().mockImplementation((key) => Promise.resolve(key)),
  };
  
  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        LoggerService,
        TranslationService,
        DatabaseUserRepository,
        DatabaseRoomRepository,
        {
          provide: UsecasesProxyModule.GET_USER_BY_ID_USECASES_PROXY,
          useFactory: () => new UseCaseProxy(new GetUserByIdUseCases(mockLoggerService as any, mockDatabaseUserRepository as any))
        },
        {
          provide: UsecasesProxyModule.ADD_USER_USECASES_PROXY,
          useFactory: () => new UseCaseProxy(new AddUserUseCases(mockLoggerService as any, mockDatabaseUserRepository as any))
        },
        {
          provide: UsecasesProxyModule.GET_USER_BY_EMAIL_USECASES_PROXY,
          useFactory: () => new UseCaseProxy(new GetUserByEmailUseCases(mockLoggerService as any, mockDatabaseUserRepository as any))
        },
        {
          provide: UsecasesProxyModule.GET_USERS_USESCASES_PROXY,
          useFactory: () => new UseCaseProxy(new GetUsersUseCases(mockLoggerService as any, mockDatabaseUserRepository as any))
        },
        {
          provide: UsecasesProxyModule.UPDATE_USER_USECASES_PROXY,
          useFactory: () => new UseCaseProxy(new UpdateUserUseCases(mockLoggerService as any, mockDatabaseUserRepository as any))
        },
        {
          provide: UsecasesProxyModule.DELETE_USER_BY_ID_USECASES_PROXY,
          useFactory: () => new UseCaseProxy(new DeleteUserByIdUseCases(mockLoggerService as any, mockDatabaseUserRepository as any))
        },
        {
          provide: UsecasesProxyModule.CHECK_UNKNOWN_USER_USESCASES_PROXY,
          useFactory: () => new UseCaseProxy(new CheckUnknownUserUseCases(mockLoggerService as any, mockDatabaseUserRepository as any))
        },
        {
          provide: UsecasesProxyModule.CREATE_ROOM_USECASES_PROXY,
          useFactory: () => new UseCaseProxy(new CreateRoomUseCases(mockLoggerService as any, mockDatabaseRoomRepository as any))
        },
        {
          provide: UsecasesProxyModule.ADD_USER_TO_ROOM_USECASES_PROXY,
          useFactory: () => new UseCaseProxy(new AddUserToRoomUseCases(mockLoggerService as any, mockDatabaseRoomRepository as any, mockTranslationService as any))
        },
        {
          provide: UsecasesProxyModule.REMOVE_USER_FROM_ROOM_USECASES_PROXY,
          useFactory: () => new UseCaseProxy(new RemoveUserFromRoomUseCases(mockLoggerService as any, mockDatabaseRoomRepository as any))
        },
        {
          provide: UsecasesProxyModule.GAME_IS_STARTED_USECASES_PROXY,
          useFactory: () => new UseCaseProxy(new GameIsStartedUseCases(mockLoggerService as any, mockDatabaseRoomRepository as any))
        },
        {
          provide: UsecasesProxyModule.GET_ROOM_USERS_USECASES_PROXY,
          useFactory: () => new UseCaseProxy(new GetRoomUsersUseCases(mockLoggerService as any, mockDatabaseRoomRepository as any))
        },
        {
          provide: UsecasesProxyModule.IS_HOST_USECASES_PROXY,
          useFactory: () => new UseCaseProxy(new IsHostUseCases(mockLoggerService as any, mockDatabaseRoomRepository as any))
        },
        {
          provide: UsecasesProxyModule.GET_SOCKET_ID_USECASES_PROXY,
          useFactory: () => new UseCaseProxy(new GetSocketIdUseCases(mockLoggerService as any, mockDatabaseRoomRepository as any))
        },
        {
          provide: UsecasesProxyModule.GET_ROOM_USECASES_PROXY,
          useFactory: () => new UseCaseProxy(new GetRoomUseCases(mockLoggerService as any, mockDatabaseRoomRepository as any))
        },
        {
          provide: UsecasesProxyModule.NEW_ROUND_USECASES_PROXY,
          useFactory: () => new UseCaseProxy(new NewRoundUseCases(mockLoggerService as any, mockDatabaseRoomRepository as any))
        },
        {
          provide: UsecasesProxyModule.GET_CURRENT_ROUND_USER,
          useFactory: () => new UseCaseProxy(new GetCurrentRoundUserUseCases(mockLoggerService as any, mockDatabaseRoomRepository as any))
        },
        {
          provide: UsecasesProxyModule.START_GAME_USECASES_PROXY,
          useFactory: () => {
            const newRoundUseCases = new UseCaseProxy(new NewRoundUseCases(mockLoggerService as any, mockDatabaseRoomRepository as any));
            return new UseCaseProxy(new StartGameUseCases(mockLoggerService as any, mockDatabaseRoomRepository as any, mockTranslationService as any, newRoundUseCases as any));
          }
        },
        {
          provide: UsecasesProxyModule.GET_ROUND_USECASES_PROXY,
          useFactory: () => new UseCaseProxy(new GetRoundUseCases(mockLoggerService as any, mockDatabaseRoomRepository as any))
        },
        {
          provide: UsecasesProxyModule.GET_BOARD_USECASES_PROXY,
          useFactory: () => new UseCaseProxy(new GetBoardUseCases(mockLoggerService as any, mockDatabaseRoomRepository as any))
        },
        {
          provide: UsecasesProxyModule.GET_USER_GAME_USECASES_PROXY,
          useFactory: () => new UseCaseProxy(new GetUserGameUseCases(mockLoggerService as any, mockDatabaseRoomRepository as any))
        },
      ],
    })
    .overrideProvider(LoggerService)
    .useValue(mockLoggerService)
    .overrideProvider(TranslationService)
    .useValue(mockTranslationService)
    .overrideProvider(DatabaseUserRepository)
    .useValue(mockDatabaseUserRepository) 
    .overrideProvider(DatabaseRoomRepository)
    .useValue(mockDatabaseRoomRepository)
    .compile();
  });
  
  it('should be defined', () => {
    expect(moduleRef).toBeDefined();
  });
  
  describe('User Use Cases Proxies', () => {
    it('should provide GET_USER_BY_ID_USECASES_PROXY', () => {
      const proxy = moduleRef.get(UsecasesProxyModule.GET_USER_BY_ID_USECASES_PROXY);
      expect(proxy).toBeInstanceOf(UseCaseProxy);
      expect(proxy.getInstance()).toBeInstanceOf(GetUserByIdUseCases);
    });
    
    it('should provide ADD_USER_USECASES_PROXY', () => {
      const proxy = moduleRef.get(UsecasesProxyModule.ADD_USER_USECASES_PROXY);
      expect(proxy).toBeInstanceOf(UseCaseProxy);
      expect(proxy.getInstance()).toBeInstanceOf(AddUserUseCases);
    });
    
    it('should provide GET_USER_BY_EMAIL_USECASES_PROXY', () => {
      const proxy = moduleRef.get(UsecasesProxyModule.GET_USER_BY_EMAIL_USECASES_PROXY);
      expect(proxy).toBeInstanceOf(UseCaseProxy);
      expect(proxy.getInstance()).toBeInstanceOf(GetUserByEmailUseCases);
    });
    
    it('should provide GET_USERS_USESCASES_PROXY', () => {
      const proxy = moduleRef.get(UsecasesProxyModule.GET_USERS_USESCASES_PROXY);
      expect(proxy).toBeInstanceOf(UseCaseProxy);
      expect(proxy.getInstance()).toBeInstanceOf(GetUsersUseCases);
    });
    
    it('should provide UPDATE_USER_USECASES_PROXY', () => {
      const proxy = moduleRef.get(UsecasesProxyModule.UPDATE_USER_USECASES_PROXY);
      expect(proxy).toBeInstanceOf(UseCaseProxy);
      expect(proxy.getInstance()).toBeInstanceOf(UpdateUserUseCases);
    });
    
    it('should provide DELETE_USER_BY_ID_USECASES_PROXY', () => {
      const proxy = moduleRef.get(UsecasesProxyModule.DELETE_USER_BY_ID_USECASES_PROXY);
      expect(proxy).toBeInstanceOf(UseCaseProxy);
      expect(proxy.getInstance()).toBeInstanceOf(DeleteUserByIdUseCases);
    });
    
    it('should provide CHECK_UNKNOWN_USER_USESCASES_PROXY', () => {
      const proxy = moduleRef.get(UsecasesProxyModule.CHECK_UNKNOWN_USER_USESCASES_PROXY);
      expect(proxy).toBeInstanceOf(UseCaseProxy);
      expect(proxy.getInstance()).toBeInstanceOf(CheckUnknownUserUseCases);
    });
  });
  
  describe('Room Use Cases Proxies', () => {
    it('should provide CREATE_ROOM_USECASES_PROXY', () => {
      const proxy = moduleRef.get(UsecasesProxyModule.CREATE_ROOM_USECASES_PROXY);
      expect(proxy).toBeInstanceOf(UseCaseProxy);
      expect(proxy.getInstance()).toBeInstanceOf(CreateRoomUseCases);
    });
    
    it('should provide ADD_USER_TO_ROOM_USECASES_PROXY', () => {
      const proxy = moduleRef.get(UsecasesProxyModule.ADD_USER_TO_ROOM_USECASES_PROXY);
      expect(proxy).toBeInstanceOf(UseCaseProxy);
      expect(proxy.getInstance()).toBeInstanceOf(AddUserToRoomUseCases);
    });
  });
  
  describe('Game Use Cases Proxies', () => {
    it('should provide START_GAME_USECASES_PROXY', () => {
      const proxy = moduleRef.get(UsecasesProxyModule.START_GAME_USECASES_PROXY);
      expect(proxy).toBeInstanceOf(UseCaseProxy);
      expect(proxy.getInstance()).toBeInstanceOf(StartGameUseCases);
    });
    
  });
});
