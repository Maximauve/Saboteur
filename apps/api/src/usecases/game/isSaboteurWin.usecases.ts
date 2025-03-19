import { type ILogger } from '@/domain/logger/logger.interface';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';

export class IsSaboteurWinUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository) {}

  async execute(code: string): Promise<boolean> {
    const round = await this.roomRepository.getRound(code);
    return !round.users.some(user => user.cards.length);
  }
}
