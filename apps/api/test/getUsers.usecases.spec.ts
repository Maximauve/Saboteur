import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { UserM } from '@/domain/model/user';
import { UserRepository } from '@/domain/repositories/userRepository.interface';
import { GetUsersUseCases } from '@/usecases/user/getUsers.usecases';
import { Role } from '@/domain/model/role';

describe('GetUsersUseCases', () => {
  let getUsersUseCases: GetUsersUseCases;
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

    getUsersUseCases = new GetUsersUseCases(
      loggerMock,
      userRepositoryMock
    );
  });

  describe('execute', () => {
    it('should get all users', async () => {
      const mockUsers: UserM[] = [
        {
          id: '12345',
          email: 'test1@example.com',
          username: 'test1',
          password: 'test1',
          role: Role.Admin,
          createdDate: new Date()
        },
        {
          id: '67890',
          email: 'test2@example.com',
          username: 'test2',
          password: 'test2',
          role: Role.Admin,
          createdDate: new Date()
        }
      ];

      (userRepositoryMock.getAll as jest.Mock).mockResolvedValue(mockUsers);

      const result = await getUsersUseCases.execute();

      expect(result).toEqual(mockUsers);
      expect(userRepositoryMock.getAll).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array if no users are found', async () => {
      (userRepositoryMock.getAll as jest.Mock).mockResolvedValue([]);

      const result = await getUsersUseCases.execute();

      expect(result).toEqual([]);
      expect(userRepositoryMock.getAll).toHaveBeenCalledTimes(1);
    });

    it('should handle errors from the user repository', async () => {
      (userRepositoryMock.getAll as jest.Mock).mockRejectedValue(new Error('Erreur lors de la récupération des utilisateurs'));

      await expect(getUsersUseCases.execute())
        .rejects
        .toThrowError('Erreur lors de la récupération des utilisateurs');
    });
  });
});
