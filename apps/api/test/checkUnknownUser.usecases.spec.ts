import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { UserRepository } from '@/domain/repositories/userRepository.interface';
import { RegisterDto } from '@/infrastructure/controllers/auth/auth-dto';
import { CheckUnknownUserUseCases } from '@/usecases/user/checkUnknownUser.usecases';

describe('CheckUnknownUserUseCases', () => {
  let checkUnknownUserUseCases: CheckUnknownUserUseCases;
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

    checkUnknownUserUseCases = new CheckUnknownUserUseCases(
      loggerMock,
      userRepositoryMock
    );
  });

  describe('execute', () => {
    it('should return true if the user is unknown', async () => {
      const mockUser: RegisterDto = {
        email: 'test@example.com',
        username: 'test',
        password: 'test'
      };

      (userRepositoryMock.checkUnknownUser as jest.Mock).mockResolvedValue(true);

      const result = await checkUnknownUserUseCases.execute(mockUser);

      expect(result).toBe(true);
      expect(userRepositoryMock.checkUnknownUser).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.checkUnknownUser).toHaveBeenCalledWith(mockUser);
    });

    it('should return false if the user is known', async () => {
      const mockUser: RegisterDto = {
        email: 'test@example.com',
        username: 'test',
        password: 'test'
      };

      (userRepositoryMock.checkUnknownUser as jest.Mock).mockResolvedValue(false);

      const result = await checkUnknownUserUseCases.execute(mockUser);

      expect(result).toBe(false);
      expect(userRepositoryMock.checkUnknownUser).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.checkUnknownUser).toHaveBeenCalledWith(mockUser);
    });

    it('should handle errors from the user repository', async () => {
      const mockUser: RegisterDto = {
        email: 'test@example.com',
        username: 'test',
        password: 'test'
      };

      (userRepositoryMock.checkUnknownUser as jest.Mock).mockRejectedValue(new Error('Erreur lors de la vérification de l\'utilisateur'));

      await expect(checkUnknownUserUseCases.execute(mockUser))
        .rejects
        .toThrowError('Erreur lors de la vérification de l\'utilisateur');
    });

    it('should handle missing fields in the user', async () => {
      const mockUser: RegisterDto = {
        email: 'test@example.com',
        username: '',
        password: ''
      };

      (userRepositoryMock.checkUnknownUser as jest.Mock).mockResolvedValue(true);

      const result = await checkUnknownUserUseCases.execute(mockUser);

      expect(result).toBe(true);
      expect(userRepositoryMock.checkUnknownUser).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.checkUnknownUser).toHaveBeenCalledWith(mockUser);
    });
  });
});
