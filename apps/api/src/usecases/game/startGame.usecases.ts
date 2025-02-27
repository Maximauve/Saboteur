import { type ILogger } from '@/domain/logger/logger.interface';
import { type UserGame, type UserSocket } from '@/domain/model/user';
import { type GameRepository } from '@/domain/repositories/gameRepositories';

export class StartGameUseCases {
  constructor(private readonly logger: ILogger, private readonly gameRepository: GameRepository) {}

  async execute(code: string, user: UserSocket): Promise<UserGame[]> {
    return this.gameRepository.startGame(code, user);
  }
}
