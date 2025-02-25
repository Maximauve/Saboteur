import { type ILogger } from '@/domain/logger/logger.interface';
import { UserM } from '@/domain/model/user';
import { type UserRepository } from '@/domain/repositories/userRepository.interface';
import { type CreateUserDto } from '@/infrastructure/controllers/user/user.dto';

export class AddUserUsecaseProxy {
  constructor(private readonly logger: ILogger, private readonly userRepository: UserRepository) {}

  async execute(body: CreateUserDto): Promise<UserM> {
    const user = new UserM();
    user.email = body.email;
    user.username = body.username;
    user.password = body.password;
    // check si l'email existe pas deja
    const result = await this.userRepository.insert(user);
    this.logger.log('addUserUsecase execute', 'New user have been inserted');
    return result;
  }
}
