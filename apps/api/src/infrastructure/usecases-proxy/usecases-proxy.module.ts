import { DynamicModule, Module } from '@nestjs/common';

import { ExceptionsModule } from '@/infrastructure/exceptions/exceptions.module';
import { LoggerModule } from '@/infrastructure/logger/logger.module';
import { LoggerService } from '@/infrastructure/logger/logger.service';
import { RepositoriesModule } from '@/infrastructure/repositories/repositories.module';
import { DatabaseUserRepository } from '@/infrastructure/repositories/user.repository';
import { JwtModule } from '@/infrastructure/services/jwt/jwt.module';
import { UseCaseProxy } from '@/infrastructure/usecases-proxy/usecases-proxy';
// import { IsAuthenticatedUseCases } from '@/usecases/auth/isAuthenticated.usecases';
// import { LoginUseCases } from '@/usecases/auth/login.usecases';
import { AddUserUsecaseProxy } from '@/usecases/user/addUser.usecases';
import { DeleteUserByIdUseCases } from '@/usecases/user/deleteUser.usecases';
import { GetUserByEmailUseCases } from '@/usecases/user/getUserByEmail.usecases';
import { GetUserByIdUseCases } from '@/usecases/user/getUserById.usecases';
import { GetUsersUseCases } from '@/usecases/user/getUsers.usecases';
import { UpdateUserUseCases } from '@/usecases/user/updateUser.usecases';

@Module({
  imports: [LoggerModule, JwtModule, RepositoriesModule, ExceptionsModule],
})
export class UsecasesProxyModule {
  // Auth
  // static LOGIN_USECASES_PROXY = 'LoginUseCasesProxy';
  // static IS_AUTHENTICATED_USECASES_PROXY = 'IsAuthenticatedUseCasesProxy';
  // static LOGOUT_USECASES_PROXY = 'LogoutUseCasesProxy';

  static GET_USER_BY_ID_USECASES_PROXY = 'getUserByIdUsecasesProxy';
  static GET_USER_BY_EMAIL_USECASES_PROXY = 'getUserByEmailUsecasesProxy';
  static GET_USERS_USESCASES_PROXY = "getUsersUsescasesProxy";
  static ADD_USER_USECASES_PROXY = 'addUserUsecasesProxy';
  static UPDATE_USER_USECASES_PROXY = "updateUserUsecasesProxy";
  static DELETE_USER_BY_ID_USECASES_PROXY = "deleteUserByIdUsecasesProxy";

  static register(): DynamicModule {
    return {
      module: UsecasesProxyModule,
      providers: [
        // {
        //   inject: [LoggerService, JwtTokenService, EnvironmentConfigService, DatabaseUserRepository, BcryptService],
        //   provide: UsecasesProxyModule.LOGIN_USECASES_PROXY,
        //   useFactory: (
        //     logger: LoggerService,
        //     jwtTokenService: JwtTokenService,
        //     config: EnvironmentConfigService,
        //     userRepo: DatabaseUserRepository,
        //     bcryptService: BcryptService,
        //   ) => new UseCaseProxy(new LoginUseCases(logger, jwtTokenService, config, userRepo, bcryptService)),
        // },
        // {
        //   inject: [DatabaseUserRepository],
        //   provide: UsecasesProxyModule.IS_AUTHENTICATED_USECASES_PROXY,
        //   useFactory: (userRepo: DatabaseUserRepository) => new UseCaseProxy(new IsAuthenticatedUseCases(userRepo)),
        // },
        // {
        //   inject: [],
        //   provide: UsecasesProxyModule.LOGOUT_USECASES_PROXY,
        //   useFactory: () => new UseCaseProxy(new LogoutUseCases()),
        // },
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
            new UseCaseProxy(new AddUserUsecaseProxy(logger, userRepository))
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
      ],
      exports: [
        // UsecasesProxyModule.LOGIN_USECASES_PROXY,
        // UsecasesProxyModule.IS_AUTHENTICATED_USECASES_PROXY,
        // UsecasesProxyModule.LOGOUT_USECASES_PROXY,
        UsecasesProxyModule.GET_USER_BY_ID_USECASES_PROXY,
        UsecasesProxyModule.GET_USER_BY_EMAIL_USECASES_PROXY,
        UsecasesProxyModule.GET_USERS_USESCASES_PROXY,
        UsecasesProxyModule.ADD_USER_USECASES_PROXY,
        UsecasesProxyModule.UPDATE_USER_USECASES_PROXY,
        UsecasesProxyModule.DELETE_USER_BY_ID_USECASES_PROXY
      ],
    };
  }
}
