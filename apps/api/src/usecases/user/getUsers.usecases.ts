import { type ILogger } from '@/domain/logger/logger.interface';
import { type UserM } from '@/domain/model/user';
import { type UserRepository } from '@/domain/repositories/userRepository.interface';

export class GetUsersUseCases {
  constructor(private readonly logger: ILogger, private readonly userRepository: UserRepository) {}

  async execute(): Promise<UserM[]> {
    return this.userRepository.getAll();
  }
}
