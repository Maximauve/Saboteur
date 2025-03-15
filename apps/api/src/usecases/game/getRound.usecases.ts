import { type ILogger } from '@/domain/logger/logger.interface';
import { type Round } from '@/domain/model/round';
import { type GameRepository } from '@/domain/repositories/gameRepositories';

export class GetRoundUseCases {
  constructor(private readonly logger: ILogger, private readonly gameRepository: GameRepository) {}

  async execute(code: string, roundNumber?: number): Promise<Round> {
    return this.gameRepository.getRound(code, roundNumber);
  }
}
