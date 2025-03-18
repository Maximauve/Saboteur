import { type ILogger } from '@/domain/logger/logger.interface';
import { type UserGame } from '@/domain/model/user';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';

export class GetUserGameUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository) {}

  async execute(code: string, userId: string): Promise<UserGame> {
    return this.roomRepository.getUserGame(code, userId);
  }
}
