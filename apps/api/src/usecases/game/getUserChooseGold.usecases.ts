import { type ILogger } from '@/domain/logger/logger.interface';
import { type UserGame } from '@/domain/model/user';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';

export class GetUserChooseGoldUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository) {}

  async execute(code: string): Promise<UserGame | undefined> {
    const round = await this.roomRepository.getRound(code);
    return round.users.find(roundUser => roundUser.hasToChooseGold);
  }
}
