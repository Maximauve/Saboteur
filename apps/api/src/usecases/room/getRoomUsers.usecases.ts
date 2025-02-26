import { type ILogger } from '@/domain/logger/logger.interface';
import { type UserSocket } from '@/domain/model/user';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';

export class GetRoomUsersUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository) {}

  async execute(code: string): Promise<UserSocket[]> {
    return this.roomRepository.getRoomUsers(code);
  }
}
