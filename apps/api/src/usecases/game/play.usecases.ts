import { type ILogger } from '@/domain/logger/logger.interface';
import { type UserSocket } from '@/domain/model/user';
import { type GameRepository } from '@/domain/repositories/gameRepositories';

export class PlayUseCases {
  constructor(private readonly logger: ILogger, private readonly gameRepository: GameRepository) {}

  async execute(code: string, user: UserSocket): Promise<void> {
    // le move est à ajouter je pense en params mais faut créer un nouveau type
    return this.gameRepository.play(code, user);
  }
}
