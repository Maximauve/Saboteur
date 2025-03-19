import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserController } from '@/infrastructure/controllers/user/user.controller';
import { TranslationService } from '@/infrastructure/services/translation/translation.service';
import { UseCaseProxy } from '@/infrastructure/usecases-proxy/usecases-proxy';
import { UsecasesProxyModule } from '@/infrastructure/usecases-proxy/usecases-proxy.module';
import { GetUserByIdUseCases } from '@/usecases/user/getUserById.usecases';
import { AddUserUseCases } from '@/usecases/user/addUser.usecases';
import { GetUserByEmailUseCases } from '@/usecases/user/getUserByEmail.usecases';
import { GetUsersUseCases } from '@/usecases/user/getUsers.usecases';
import { UpdateUserUseCases } from '@/usecases/user/updateUser.usecases';
import { DeleteUserByIdUseCases } from '@/usecases/user/deleteUser.usecases';
import { UserPresenter } from '@/infrastructure/controllers/user/user.presenter';
import { UpdatedUserDto } from '@/infrastructure/controllers/user/user.dto';
import { Role } from '@/domain/model/role';

describe('UserController', () => {
  let userController: UserController;
  let getUserByIdUsecaseProxy: UseCaseProxy<GetUserByIdUseCases>;
  let addUserUsecaseProxy: UseCaseProxy<AddUserUseCases>;
  let getUserByEmailUsecaseProxy: UseCaseProxy<GetUserByEmailUseCases>;
  let getUsersUsecaseProxy: UseCaseProxy<GetUsersUseCases>;
  let updateUserUsecaseProxy: UseCaseProxy<UpdateUserUseCases>;
  let deleteUserByIdUsecaseProxy: UseCaseProxy<DeleteUserByIdUseCases>;
  let translationService: TranslationService;

  const mockUser = {
    id: '1',
    email: 'test@test.com',
    username: 'testuser',
    password: 'hashedpassword',
    createdDate: new Date(),
    role: Role.Customer
  };

  const mockUsers = [
    mockUser,
    {
      id: '2',
      email: 'test2@test.com',
      username: 'testuser2',
      password: 'hashedpassword2',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  beforeEach(async () => {
    // Mock all use cases
    const getUserByIdUseCasesMock = {
      execute: jest.fn()
    };

    const addUserUseCasesMock = {
      execute: jest.fn()
    };

    const getUserByEmailUseCasesMock = {
      execute: jest.fn()
    };

    const getUsersUseCasesMock = {
      execute: jest.fn()
    };

    const updateUserUseCasesMock = {
      execute: jest.fn()
    };

    const deleteUserByIdUseCasesMock = {
      execute: jest.fn()
    };

    const translationServiceMock = {
      translate: jest.fn().mockResolvedValue('translated_error_message')
    };

    getUserByIdUsecaseProxy = {
      getInstance: () => getUserByIdUseCasesMock
    } as any;

    addUserUsecaseProxy = {
      getInstance: () => addUserUseCasesMock
    } as any;

    getUserByEmailUsecaseProxy = {
      getInstance: () => getUserByEmailUseCasesMock
    } as any;

    getUsersUsecaseProxy = {
      getInstance: () => getUsersUseCasesMock
    } as any;

    updateUserUsecaseProxy = {
      getInstance: () => updateUserUseCasesMock
    } as any;

    deleteUserByIdUsecaseProxy = {
      getInstance: () => deleteUserByIdUseCasesMock
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UsecasesProxyModule.GET_USER_BY_ID_USECASES_PROXY,
          useValue: getUserByIdUsecaseProxy
        },
        {
          provide: UsecasesProxyModule.ADD_USER_USECASES_PROXY,
          useValue: addUserUsecaseProxy
        },
        {
          provide: UsecasesProxyModule.GET_USER_BY_EMAIL_USECASES_PROXY,
          useValue: getUserByEmailUsecaseProxy
        },
        {
          provide: UsecasesProxyModule.GET_USERS_USESCASES_PROXY,
          useValue: getUsersUsecaseProxy
        },
        {
          provide: UsecasesProxyModule.UPDATE_USER_USECASES_PROXY,
          useValue: updateUserUsecaseProxy
        },
        {
          provide: UsecasesProxyModule.DELETE_USER_BY_ID_USECASES_PROXY,
          useValue: deleteUserByIdUsecaseProxy
        },
        {
          provide: TranslationService,
          useValue: translationServiceMock
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    translationService = module.get<TranslationService>(TranslationService);
  });

  describe('getAllUsers', () => {
    it('should return an array of user presenters', async () => {
      getUsersUsecaseProxy.getInstance().execute = jest.fn().mockResolvedValue(mockUsers);
      
      const result = await userController.getAllUsers();
      
      expect(getUsersUsecaseProxy.getInstance().execute).toHaveBeenCalled();
      expect(result).toHaveLength(mockUsers.length);
      expect(result[0]).toBeInstanceOf(UserPresenter);
      expect(result[0].id).toEqual(mockUsers[0].id);
    });
  });

  describe('getMe', () => {
    it('should return the current user as a presenter', async () => {
      getUserByIdUsecaseProxy.getInstance().execute = jest.fn().mockResolvedValue(mockUser);
      
      const result = await userController.getMe(mockUser);
      
      expect(getUserByIdUsecaseProxy.getInstance().execute).toHaveBeenCalledWith(mockUser.id);
      expect(result).toBeInstanceOf(UserPresenter);
      expect(result?.id).toEqual(mockUser.id);
    });

    it('should throw HttpException when user is not found', async () => {
      getUserByIdUsecaseProxy.getInstance().execute = jest.fn().mockResolvedValue(null);
      
      await expect(userController.getMe(mockUser)).rejects.toThrow(
        new HttpException('translated_error_message', HttpStatus.NOT_FOUND)
      );
      
      expect(getUserByIdUsecaseProxy.getInstance().execute).toHaveBeenCalledWith(mockUser.id);
      expect(translationService.translate).toHaveBeenCalledWith('error.USER_NOT_FOUND');
    });
  });

  describe('getUserById', () => {
    it('should return user by id as a presenter', async () => {
      getUserByIdUsecaseProxy.getInstance().execute = jest.fn().mockResolvedValue(mockUser);
      
      const result = await userController.getUserById(mockUser.id);
      
      expect(getUserByIdUsecaseProxy.getInstance().execute).toHaveBeenCalledWith(mockUser.id);
      expect(result).toBeInstanceOf(UserPresenter);
      expect(result.id).toEqual(mockUser.id);
    });

    it('should throw HttpException when user is not found', async () => {
      getUserByIdUsecaseProxy.getInstance().execute = jest.fn().mockResolvedValue(null);
      
      await expect(userController.getUserById(mockUser.id)).rejects.toThrow(
        new HttpException('translated_error_message', HttpStatus.NOT_FOUND)
      );
      
      expect(getUserByIdUsecaseProxy.getInstance().execute).toHaveBeenCalledWith(mockUser.id);
      expect(translationService.translate).toHaveBeenCalledWith('error.USER_NOT_FOUND');
    });
  });

  describe('updateUser', () => {
    it('should call update use case with correct parameters', async () => {
      const updateDto: UpdatedUserDto = { username: 'newUsername' };
      updateUserUsecaseProxy.getInstance().execute = jest.fn().mockResolvedValue(undefined);
      
      await userController.updateUser(mockUser, updateDto);
      
      expect(updateUserUsecaseProxy.getInstance().execute).toHaveBeenCalledWith(mockUser.id, updateDto);
    });
  });

  describe('deleteById', () => {
    it('should call delete use case with correct id', async () => {
      deleteUserByIdUsecaseProxy.getInstance().execute = jest.fn().mockResolvedValue(undefined);
      
      await userController.deleteById(mockUser);
      
      expect(deleteUserByIdUsecaseProxy.getInstance().execute).toHaveBeenCalledWith(mockUser.id);
    });
  });
});
