import { type ILogger } from '@/domain/logger/logger.interface';
import { type UserRepository } from '@/domain/repositories/userRepository.interface';

export class DeleteUserByIdUseCases {
  constructor(private readonly logger: ILogger, private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<void> {
    await this.userRepository.deleteById(id);
    this.logger.log('deleteTodoUseCases execute', `Todo ${id} have been deleted`);
  }
}
