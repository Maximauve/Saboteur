import { type ILogger } from "@/domain/logger/logger.interface";
import { type UserRepository } from "@/domain/repositories/userRepository.interface";
import { type RegisterDto } from "@/infrastructure/controllers/auth/auth-dto";

export class CheckUnknownUserUseCases {
  constructor(private readonly logger: ILogger, private readonly userRepository: UserRepository) {}

  async execute(user: RegisterDto): Promise<boolean> {
    return this.userRepository.checkUnknownUser(user);
  }
}