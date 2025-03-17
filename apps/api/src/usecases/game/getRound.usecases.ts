import { type ILogger } from '@/domain/logger/logger.interface';
import { type Round } from '@/domain/model/round';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';

export class GetRoundUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository) {}

  async execute(code: string, roundNumber?: number): Promise<Round> {
    return this.roomRepository.getRound(code, roundNumber);
  }
}
