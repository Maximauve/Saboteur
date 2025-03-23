import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { UserM } from '@/domain/model/user';
import { UserRepository } from '@/domain/repositories/userRepository.interface';
import { GetUserByIdUseCases } from '@/usecases/user/getUserById.usecases';
import { Role } from '@/domain/model/role';

describe('GetUserByIdUseCases', () => {
  let getUserByIdUseCases: GetUserByIdUseCases;
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

    getUserByIdUseCases = new GetUserByIdUseCases(
      loggerMock,
      userRepositoryMock
    );
  });

  describe('execute', () => {
    it('should get a user by id', async () => {
      const mockId = '12345';
      const mockUser: UserM = {
        id: mockId,
        email: 'test@example.com',
        username: 'test',
        password: 'test',
        role: Role.Admin,
        createdDate: new Date()
      };

      (userRepositoryMock.getOneById as jest.Mock).mockResolvedValue(mockUser);

      const result = await getUserByIdUseCases.execute(mockId);

      expect(result).toEqual(mockUser);
      expect(userRepositoryMock.getOneById).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.getOneById).toHaveBeenCalledWith(mockId);
    });

    it('should return null if no user is found', async () => {
      const mockId = '12345';

      (userRepositoryMock.getOneById as jest.Mock).mockResolvedValue(null);

      const result = await getUserByIdUseCases.execute(mockId);

      expect(result).toBeNull();
      expect(userRepositoryMock.getOneById).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.getOneById).toHaveBeenCalledWith(mockId);
    });

    it('should handle errors from the user repository', async () => {
      const mockId = '12345';

      (userRepositoryMock.getOneById as jest.Mock).mockRejectedValue(new Error('Erreur lors de la récupération de l\'utilisateur'));

      await expect(getUserByIdUseCases.execute(mockId))
        .rejects
        .toThrowError('Erreur lors de la récupération de l\'utilisateur');
    });

    it('should handle empty id', async () => {
      const mockId = '';

      (userRepositoryMock.getOneById as jest.Mock).mockResolvedValue(null);

      const result = await getUserByIdUseCases.execute(mockId);

      expect(result).toBeNull();
      expect(userRepositoryMock.getOneById).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.getOneById).toHaveBeenCalledWith(mockId);
    });
  });
});
