import { type ILogger } from '@/domain/logger/logger.interface';
import { type UserRepository } from '@/domain/repositories/userRepository.interface';
import { type UpdatedUserDto } from '@/infrastructure/controllers/user/user.dto';

export class UpdateUserUseCases {
  constructor(private readonly logger: ILogger, private readonly userRepository: UserRepository) {}

  async execute(id: string, userBody: UpdatedUserDto): Promise<void> {
    await this.userRepository.update(id, userBody);
    this.logger.log('updateUserUseCases execute', `User ${id} have been updated`);
  }
}
