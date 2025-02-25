import { type UserM, type UserWithoutPassword } from '@/domain/model/user';
import { type UserRepository } from '@/domain/repositories/userRepository.interface';

export class IsAuthenticatedUseCases {
  constructor(private readonly adminUserRepo: UserRepository) {}

  async execute(username: string): Promise<UserWithoutPassword> {
    const user: UserM = await this.adminUserRepo.getUserByUsername(username);
    const { password, ...info } = user;
    return info;
  }
}
