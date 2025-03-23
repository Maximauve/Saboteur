import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { UserM } from '@/domain/model/user';
import { UserRepository } from '@/domain/repositories/userRepository.interface';
import { RegisterDto } from '@/infrastructure/controllers/auth/auth-dto';
import { AddUserUseCases } from '@/usecases/user/addUser.usecases';
import { Role } from '@/domain/model/role';

describe('AddUserUseCases', () => {
  let addUserUseCases: AddUserUseCases;
  let loggerMock: ILogger;
  let userRepositoryMock: UserRepository;

  beforeEach(async () => {
    loggerMock = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn()
    };

    userRepositoryMock = {
      insert: jest.fn(),
      checkUnknownUser: jest.fn(),
      deleteById: jest.fn(),
      getAll: jest.fn(),
      getOneByEmail: jest.fn(),
      update: jest.fn(),
      getOneById: jest.fn(),
      getUserByUsername: jest.fn(),
    };

    addUserUseCases = new AddUserUseCases(
      loggerMock,
      userRepositoryMock
    );
  });

  describe('execute', () => {
    it('should add a new user', async () => {
      const mockBody: RegisterDto = {
        email: 'test@example.com',
        username: 'test',
        password: 'test'
      };

      const mockUser: UserM = {
        email: mockBody.email,
        username: mockBody.username,
        password: mockBody.password,
        id: '',
        role: Role.Admin,
        createdDate: new Date()
      };

      (userRepositoryMock.insert as jest.Mock).mockResolvedValue(mockUser);

      const result = await addUserUseCases.execute(mockBody);

      expect(result).toEqual(mockUser);
      expect(loggerMock.log).toHaveBeenCalledTimes(1);
      expect(loggerMock.log).toHaveBeenCalledWith('addUserUsecase execute', 'New user have been inserted');
      expect(userRepositoryMock.insert).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.insert).toHaveBeenCalledWith(mockBody);
    });

    it('should handle errors from the user repository', async () => {
      const mockBody: RegisterDto = {
        email: 'test@example.com',
        username: 'test',
        password: 'test'
      };

      (userRepositoryMock.insert as jest.Mock).mockRejectedValue(new Error('Erreur lors de l\'insertion de l\'utilisateur'));

      await expect(addUserUseCases.execute(mockBody))
        .rejects
        .toThrowError('Erreur lors de l\'insertion de l\'utilisateur');
    });
  });
});
