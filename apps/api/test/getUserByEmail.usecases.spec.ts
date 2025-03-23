import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { UserM } from '@/domain/model/user';
import { UserRepository } from '@/domain/repositories/userRepository.interface';
import { GetUserByEmailUseCases } from '@/usecases/user/getUserByEmail.usecases';
import { Role } from '@/domain/model/role';

describe('GetUserByEmailUseCases', () => {
  let getUserByEmailUseCases: GetUserByEmailUseCases;
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

    getUserByEmailUseCases = new GetUserByEmailUseCases(
      loggerMock,
      userRepositoryMock
    );
  });

  describe('execute', () => {
    it('should get a user by email', async () => {
      const mockEmail = 'test@example.com';
      const mockUser: UserM = {
        email: mockEmail,
        username: 'test',
        password: 'test',
        id: '',
        role: Role.Admin,
        createdDate: new Date()
      };

      (userRepositoryMock.getOneByEmail as jest.Mock).mockResolvedValue(mockUser);

      const result = await getUserByEmailUseCases.execute(mockEmail);

      expect(result).toEqual(mockUser);
      expect(userRepositoryMock.getOneByEmail).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.getOneByEmail).toHaveBeenCalledWith(mockEmail);
    });

    it('should return null if no user is found', async () => {
      const mockEmail = 'test@example.com';

      (userRepositoryMock.getOneByEmail as jest.Mock).mockResolvedValue(null);

      const result = await getUserByEmailUseCases.execute(mockEmail);

      expect(result).toBeNull();
      expect(userRepositoryMock.getOneByEmail).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.getOneByEmail).toHaveBeenCalledWith(mockEmail);
    });

    it('should handle errors from the user repository', async () => {
      const mockEmail = 'test@example.com';

      (userRepositoryMock.getOneByEmail as jest.Mock).mockRejectedValue(new Error('Erreur lors de la récupération de l\'utilisateur'));

      await expect(getUserByEmailUseCases.execute(mockEmail))
        .rejects
        .toThrowError('Erreur lors de la récupération de l\'utilisateur');
    });

    it('should handle empty email', async () => {
      const mockEmail = '';

      (userRepositoryMock.getOneByEmail as jest.Mock).mockResolvedValue(null);

      const result = await getUserByEmailUseCases.execute(mockEmail);

      expect(result).toBeNull();
      expect(userRepositoryMock.getOneByEmail).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.getOneByEmail).toHaveBeenCalledWith(mockEmail);
    });
  });
});
