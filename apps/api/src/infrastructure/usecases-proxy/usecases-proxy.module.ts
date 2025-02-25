import { DynamicModule, Module } from '@nestjs/common';

import { ExceptionsModule } from '@/infrastructure/exceptions/exceptions.module';
import { LoggerModule } from '@/infrastructure/logger/logger.module';
import { LoggerService } from '@/infrastructure/logger/logger.service';
import { RepositoriesModule } from '@/infrastructure/repositories/repositories.module';
import { DatabaseTodoRepository } from '@/infrastructure/repositories/todo.repository';
import { DatabaseUserRepository } from '@/infrastructure/repositories/user.repository';
import { BcryptModule } from '@/infrastructure/services/bcrypt/bcrypt.module';
import { JwtModule } from '@/infrastructure/services/jwt/jwt.module';
import { UseCaseProxy } from '@/infrastructure/usecases-proxy/usecases-proxy';
// import { IsAuthenticatedUseCases } from '@/usecases/auth/isAuthenticated.usecases';
// import { LoginUseCases } from '@/usecases/auth/login.usecases';
import { AddTodoUseCases } from '@/usecases/todo/addTodo.usecases';
import { DeleteTodoUseCases } from '@/usecases/todo/deleteTodo.usecases';
import { GetTodoUseCases } from '@/usecases/todo/getTodo.usecases';
import { GetTodosUseCases } from '@/usecases/todo/getTodos.usecases';
import { UpdateTodoUseCases } from '@/usecases/todo/updateTodo.usecases';
import { AddUserUsecaseProxy } from '@/usecases/user/addUser.usecases';
import { GetUserByIdUseCases } from '@/usecases/user/getUser.usecases';

@Module({
  imports: [LoggerModule, JwtModule, BcryptModule, RepositoriesModule, ExceptionsModule],
})
export class UsecasesProxyModule {
  // Auth
  // static LOGIN_USECASES_PROXY = 'LoginUseCasesProxy';
  // static IS_AUTHENTICATED_USECASES_PROXY = 'IsAuthenticatedUseCasesProxy';
  // static LOGOUT_USECASES_PROXY = 'LogoutUseCasesProxy';

  static GET_TODO_USECASES_PROXY = 'getTodoUsecasesProxy';
  static GET_TODOS_USECASES_PROXY = 'getTodosUsecasesProxy';
  static POST_TODO_USECASES_PROXY = 'postTodoUsecasesProxy';
  static DELETE_TODO_USECASES_PROXY = 'deleteTodoUsecasesProxy';
  static PUT_TODO_USECASES_PROXY = 'putTodoUsecasesProxy';

  static GET_USER_BY_ID_USECASES_PROXY = 'getUserByIdUsecasesProxy';
  static ADD_USER_USECASES_PROXY = 'addUserUsecasesProxy';

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
          inject: [DatabaseTodoRepository],
          provide: UsecasesProxyModule.GET_TODO_USECASES_PROXY,
          useFactory: (todoRepository: DatabaseTodoRepository) => new UseCaseProxy(new GetTodoUseCases(todoRepository)),
        },
        {
          inject: [DatabaseTodoRepository],
          provide: UsecasesProxyModule.GET_TODOS_USECASES_PROXY,
          useFactory: (todoRepository: DatabaseTodoRepository) => new UseCaseProxy(new GetTodosUseCases(todoRepository)),
        },
        {
          inject: [LoggerService, DatabaseTodoRepository],
          provide: UsecasesProxyModule.POST_TODO_USECASES_PROXY,
          useFactory: (logger: LoggerService, todoRepository: DatabaseTodoRepository) =>
            new UseCaseProxy(new AddTodoUseCases(logger, todoRepository)),
        },
        {
          inject: [LoggerService, DatabaseTodoRepository],
          provide: UsecasesProxyModule.PUT_TODO_USECASES_PROXY,
          useFactory: (logger: LoggerService, todoRepository: DatabaseTodoRepository) =>
            new UseCaseProxy(new UpdateTodoUseCases(logger, todoRepository)),
        },
        {
          inject: [LoggerService, DatabaseTodoRepository],
          provide: UsecasesProxyModule.DELETE_TODO_USECASES_PROXY,
          useFactory: (logger: LoggerService, todoRepository: DatabaseTodoRepository) =>
            new UseCaseProxy(new DeleteTodoUseCases(logger, todoRepository)),
        },
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
        }
      ],
      exports: [
        UsecasesProxyModule.GET_TODO_USECASES_PROXY,
        UsecasesProxyModule.GET_TODOS_USECASES_PROXY,
        UsecasesProxyModule.POST_TODO_USECASES_PROXY,
        UsecasesProxyModule.PUT_TODO_USECASES_PROXY,
        UsecasesProxyModule.DELETE_TODO_USECASES_PROXY,
        // UsecasesProxyModule.LOGIN_USECASES_PROXY,
        // UsecasesProxyModule.IS_AUTHENTICATED_USECASES_PROXY,
        // UsecasesProxyModule.LOGOUT_USECASES_PROXY,
        UsecasesProxyModule.GET_USER_BY_ID_USECASES_PROXY,
        UsecasesProxyModule.ADD_USER_USECASES_PROXY,
      ],
    };
  }
}
