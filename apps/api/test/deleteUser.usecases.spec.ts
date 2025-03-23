import { Test, TestingModule } from '@nestjs/testing';
import { ILogger } from '@/domain/logger/logger.interface';
import { UserRepository } from '@/domain/repositories/userRepository.interface';
import { DeleteUserByIdUseCases } from '@/usecases/user/deleteUser.usecases';

describe('DeleteUserByIdUseCases', () => {
  let deleteUserByIdUseCases: DeleteUserByIdUseCases;
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

    deleteUserByIdUseCases = new DeleteUserByIdUseCases(
      loggerMock,
      userRepositoryMock
    );
  });

  describe('execute', () => {
    it('should delete a user by id', async () => {
      const mockId = '12345';

      (userRepositoryMock.deleteById as jest.Mock).mockResolvedValue(mockId);

      await deleteUserByIdUseCases.execute(mockId);

      expect(loggerMock.log).toHaveBeenCalledTimes(1);
      expect(loggerMock.log).toHaveBeenCalledWith('deleteUserByIdUseCases execute', `User ${mockId} have been deleted`);
      expect(userRepositoryMock.deleteById).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.deleteById).toHaveBeenCalledWith(mockId);
    });

    it('should handle errors from the user repository', async () => {
      const mockId = '12345';

      (userRepositoryMock.deleteById as jest.Mock).mockRejectedValue(new Error('Erreur lors de la suppression de l\'utilisateur'));

      await expect(deleteUserByIdUseCases.execute(mockId))
        .rejects
        .toThrowError('Erreur lors de la suppression de l\'utilisateur');
    });
  });
});
