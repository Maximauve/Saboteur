import { type ILogger } from '@/domain/logger/logger.interface';
import { UserM } from '@/domain/model/user';
import { type UserRepository } from '@/domain/repositories/userRepository.interface';
import { type RegisterDto } from '@/infrastructure/controllers/auth/auth-dto';

export class AddUserUseCases {
  constructor(private readonly logger: ILogger, private readonly userRepository: UserRepository) {}

  async execute(body: RegisterDto): Promise<UserM> {
    const user = new UserM();
    user.email = body.email;
    user.username = body.username;
    user.password = body.password;
    const result = await this.userRepository.insert(user);
    this.logger.log('addUserUsecase execute', 'New user have been inserted');
    return result;
  }
}
