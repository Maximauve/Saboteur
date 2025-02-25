import { type ILogger } from '@/domain/logger/logger.interface';
import { type UserM } from '@/domain/model/user';
import { type UserRepository } from '@/domain/repositories/userRepository.interface';

export class GetUserByEmailUseCases {
  constructor(private readonly logger: ILogger, private readonly userRepository: UserRepository) {}

  async execute(email: string): Promise<UserM | null> {
    return this.userRepository.getOneByEmail(email);
  }
}
