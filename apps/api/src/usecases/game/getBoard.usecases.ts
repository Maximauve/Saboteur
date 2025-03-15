import { type ILogger } from '@/domain/logger/logger.interface';
import { type Board } from '@/domain/model/board';
import { type GameRepository } from '@/domain/repositories/gameRepositories';

export class GetBoardUseCases {
  constructor(private readonly logger: ILogger, private readonly gameRepository: GameRepository) {}

  async execute(code: string): Promise<Board> {
    return this.gameRepository.getBoard(code);
  }
}
