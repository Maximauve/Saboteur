import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { UserRepository } from '@/domain/repositories/userRepository.interface';
import { UpdatedUserDto } from '@/infrastructure/controllers/user/user.dto';
import { UpdateUserUseCases } from '@/usecases/user/updateUser.usecases';

describe('UpdateUserUseCases', () => {
  let updateUserUseCases: UpdateUserUseCases;
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

    updateUserUseCases = new UpdateUserUseCases(
      loggerMock,
      userRepositoryMock
    );
  });

  describe('execute', () => {
    it('should update a user', async () => {
      const mockId = '12345';
      const mockUpdatedUser: UpdatedUserDto = {
        email: 'test@example.com',
        username: 'test',
        password: 'test'
      };

      (userRepositoryMock.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

      await updateUserUseCases.execute(mockId, mockUpdatedUser);

      expect(userRepositoryMock.update).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.update).toHaveBeenCalledWith(mockId, mockUpdatedUser);
      expect(loggerMock.log).toHaveBeenCalledTimes(1);
      expect(loggerMock.log).toHaveBeenCalledWith('updateUserUseCases execute', `User ${mockId} have been updated`);
    });

    it('should handle empty id', async () => {
      const mockId = '';
      const mockUpdatedUser: UpdatedUserDto = {
        email: 'test@example.com',
        username: 'test',
        password: 'test'
      };

      (userRepositoryMock.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

      await updateUserUseCases.execute(mockId, mockUpdatedUser);

      expect(userRepositoryMock.update).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.update).toHaveBeenCalledWith(mockId, mockUpdatedUser);
      expect(loggerMock.log).toHaveBeenCalledTimes(1);
      expect(loggerMock.log).toHaveBeenCalledWith('updateUserUseCases execute', `User ${mockId} have been updated`);
    });
  });
});
