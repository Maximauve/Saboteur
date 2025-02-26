import { type ILogger } from '@/domain/logger/logger.interface';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';

export class GameIsStartedUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository) {}

  async execute(code: string): Promise<boolean> {
    return this.roomRepository.gameIsStarted(code);
  }
}
