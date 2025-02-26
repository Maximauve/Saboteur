import { type ILogger } from '@/domain/logger/logger.interface';
import { type UserSocket } from '@/domain/model/user';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';

export class AddUserToRoomUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository) {}

  async execute(code: string, user: UserSocket): Promise<void> {
    return this.roomRepository.addUserToRoom(code, user);
  }
}
