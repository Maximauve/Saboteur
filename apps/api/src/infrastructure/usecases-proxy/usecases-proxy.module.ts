import { DynamicModule, Module } from '@nestjs/common';

import { ExceptionsModule } from '@/infrastructure/exceptions/exceptions.module';
import { LoggerModule } from '@/infrastructure/logger/logger.module';
import { LoggerService } from '@/infrastructure/logger/logger.service';
import { DatabaseGameRepository } from '@/infrastructure/repositories/game.repositories';
import { RepositoriesModule } from '@/infrastructure/repositories/repositories.module';
import { DatabaseRoomRepository } from '@/infrastructure/repositories/room.repositories';
import { DatabaseUserRepository } from '@/infrastructure/repositories/user.repository';
import { UseCaseProxy } from '@/infrastructure/usecases-proxy/usecases-proxy';
import { StartGameUseCases } from '@/usecases/game/startGame.usecases';
import { CreateRoomUseCases } from '@/usecases/room/createRoom.usecases';
import { GameIsStartedUseCases } from '@/usecases/room/gameIsStarted.usecases';
import { GetRoomUseCases } from '@/usecases/room/getRoom.usecases';
import { GetRoomUsersUseCases } from '@/usecases/room/getRoomUsers.usecases';
import { GetSocketIdUseCases } from '@/usecases/room/getSocketId.usecases';
import { IsHostUseCases } from '@/usecases/room/isHost.usecases';
import { RemoveUserToRoomUseCases } from '@/usecases/room/removeUserToRoom.usecases';
import { AddUserUseCases } from '@/usecases/user/addUser.usecases';
import { CheckUnknownUserUseCases } from '@/usecases/user/checkUnknownUser.usecases';
import { DeleteUserByIdUseCases } from '@/usecases/user/deleteUser.usecases';
import { GetUserByEmailUseCases } from '@/usecases/user/getUserByEmail.usecases';
import { GetUserByIdUseCases } from '@/usecases/user/getUserById.usecases';
import { GetUsersUseCases } from '@/usecases/user/getUsers.usecases';
import { UpdateUserUseCases } from '@/usecases/user/updateUser.usecases';

@Module({
  imports: [LoggerModule, RepositoriesModule, ExceptionsModule],
})
export class UsecasesProxyModule {
  static GET_USER_BY_ID_USECASES_PROXY = 'getUserByIdUsecasesProxy';
  static GET_USER_BY_EMAIL_USECASES_PROXY = 'getUserByEmailUsecasesProxy';
  static GET_USERS_USESCASES_PROXY = "getUsersUsescasesProxy";
  static ADD_USER_USECASES_PROXY = 'addUserUsecasesProxy';
  static UPDATE_USER_USECASES_PROXY = "updateUserUsecasesProxy";
  static DELETE_USER_BY_ID_USECASES_PROXY = "deleteUserByIdUsecasesProxy";
  static CHECK_UNKNOWN_USER_USESCASES_PROXY = "checkUnknownUserUsecasesProxy";

  static CREATE_ROOM_USECASES_PROXY = "createRoomUseCasesProxy";
  static ADD_USER_TO_ROOM_USECASES_PROXY = "addUserToRoomUseCasesProxy";
  static REMOVE_USER_TO_ROOM_USECASES_PROXY = "removeUserToRoomUseCasesProxy";
  static GAME_IS_STARTED_USECASES_PROXY = "gameIsStartedUseCasesProxy";
  static GET_ROOM_USERS_USECASES_PROXY = "getRoomUsersUseCasesProxy";
  static IS_HOST_USECASES_PROXY = "isHostUseCasesProxy";
  static GET_SOCKET_ID_USECASES_PROXY = "getSocketIdUseCasesProxy";
  static GET_ROOM_USECASES_PROXY = "getRoomUseCasesProxy";

  static START_GAME_USECASES_PROXY = "startGameUseCasesProxy";

  static register(): DynamicModule {
    return {
      module: UsecasesProxyModule,
      providers: [
        {
          inject: [LoggerService, DatabaseUserRepository],
          provide: UsecasesProxyModule.GET_USER_BY_ID_USECASES_PROXY,
          useFactory: (logger: LoggerService, userRepository: DatabaseUserRepository) =>
            new UseCaseProxy(new GetUserByIdUseCases(logger, userRepository))
        },
        {
          inject: [LoggerService, DatabaseUserRepository],
          provide: UsecasesProxyModule.ADD_USER_USECASES_PROXY,
          useFactory: (logger: LoggerService, userRepository: DatabaseUserRepository) =>
            new UseCaseProxy(new AddUserUseCases(logger, userRepository))
        },
        {
          inject: [LoggerService, DatabaseUserRepository],
          provide: UsecasesProxyModule.GET_USER_BY_EMAIL_USECASES_PROXY,
          useFactory: (logger: LoggerService, userRepository: DatabaseUserRepository) =>
            new UseCaseProxy(new GetUserByEmailUseCases(logger, userRepository))
        },
        {
          inject: [LoggerService, DatabaseUserRepository],
          provide: UsecasesProxyModule.GET_USERS_USESCASES_PROXY,
          useFactory: (logger: LoggerService, userRepository: DatabaseUserRepository) =>
            new UseCaseProxy(new GetUsersUseCases(logger, userRepository))
        },
        {
          inject: [LoggerService, DatabaseUserRepository],
          provide: UsecasesProxyModule.UPDATE_USER_USECASES_PROXY,
          useFactory: (logger: LoggerService, userRepository: DatabaseUserRepository) =>
            new UseCaseProxy(new UpdateUserUseCases(logger, userRepository))
        },
        {
          inject: [LoggerService, DatabaseUserRepository],
          provide: UsecasesProxyModule.DELETE_USER_BY_ID_USECASES_PROXY,
          useFactory: (logger: LoggerService, userRepository: DatabaseUserRepository) =>
            new UseCaseProxy(new DeleteUserByIdUseCases(logger, userRepository))
        },
        {
          inject: [LoggerService, DatabaseUserRepository],
          provide: UsecasesProxyModule.CHECK_UNKNOWN_USER_USESCASES_PROXY,
          useFactory: (logger: LoggerService, userRepository: DatabaseUserRepository) =>
            new UseCaseProxy(new CheckUnknownUserUseCases(logger, userRepository))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository],
          provide: UsecasesProxyModule.CREATE_ROOM_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository) =>
            new UseCaseProxy(new CreateRoomUseCases(logger, roomRepository))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository],
          provide: UsecasesProxyModule.ADD_USER_TO_ROOM_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository) =>
            new UseCaseProxy(new CreateRoomUseCases(logger, roomRepository))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository],
          provide: UsecasesProxyModule.REMOVE_USER_TO_ROOM_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository) =>
            new UseCaseProxy(new RemoveUserToRoomUseCases(logger, roomRepository))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository],
          provide: UsecasesProxyModule.GAME_IS_STARTED_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository) =>
            new UseCaseProxy(new GameIsStartedUseCases(logger, roomRepository))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository],
          provide: UsecasesProxyModule.GET_ROOM_USERS_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository) =>
            new UseCaseProxy(new GetRoomUsersUseCases(logger, roomRepository))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository],
          provide: UsecasesProxyModule.IS_HOST_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository) =>
            new UseCaseProxy(new IsHostUseCases(logger, roomRepository))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository],
          provide: UsecasesProxyModule.GET_SOCKET_ID_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository) =>
            new UseCaseProxy(new GetSocketIdUseCases(logger, roomRepository))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository],
          provide: UsecasesProxyModule.GET_ROOM_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository) =>
            new UseCaseProxy(new GetRoomUseCases(logger, roomRepository))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository],
          provide: UsecasesProxyModule.START_GAME_USECASES_PROXY,
          useFactory: (logger: LoggerService, gameRepository: DatabaseGameRepository) =>
            new UseCaseProxy(new StartGameUseCases(logger, gameRepository))
        },
      ],
      exports: [
        UsecasesProxyModule.GET_USER_BY_ID_USECASES_PROXY,
        UsecasesProxyModule.GET_USER_BY_EMAIL_USECASES_PROXY,
        UsecasesProxyModule.GET_USERS_USESCASES_PROXY,
        UsecasesProxyModule.ADD_USER_USECASES_PROXY,
        UsecasesProxyModule.UPDATE_USER_USECASES_PROXY,
        UsecasesProxyModule.DELETE_USER_BY_ID_USECASES_PROXY,
        UsecasesProxyModule.CHECK_UNKNOWN_USER_USESCASES_PROXY,
        UsecasesProxyModule.CREATE_ROOM_USECASES_PROXY,
        UsecasesProxyModule.ADD_USER_TO_ROOM_USECASES_PROXY,
        UsecasesProxyModule.REMOVE_USER_TO_ROOM_USECASES_PROXY,
        UsecasesProxyModule.GAME_IS_STARTED_USECASES_PROXY,
        UsecasesProxyModule.GET_SOCKET_ID_USECASES_PROXY,
        UsecasesProxyModule.GET_ROOM_USERS_USECASES_PROXY,
        UsecasesProxyModule.IS_HOST_USECASES_PROXY,
        UsecasesProxyModule.GET_ROOM_USECASES_PROXY,
        UsecasesProxyModule.START_GAME_USECASES_PROXY,
      ],
    };
  }
}
