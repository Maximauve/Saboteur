import { type ILogger } from '@/domain/logger/logger.interface';
import { type UserGame } from '@/domain/model/user';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';

export class GetCurrentRoundUserUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository) {}

  async execute(code: string, userId: string): Promise<UserGame|null> {
    return this.roomRepository.getCurrentRoundUser(code, userId);
  }
}
