import { type ILogger } from '@/domain/logger/logger.interface';
import { type UserM } from '@/domain/model/user';
import { type UserRepository } from '@/domain/repositories/userRepository.interface';

export class GetUserByIdUseCases {
  constructor(private readonly logger: ILogger, private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<UserM | null> {
    return this.userRepository.getOneById(id);
  }
}
