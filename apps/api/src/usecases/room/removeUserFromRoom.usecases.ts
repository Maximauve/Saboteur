import { type ILogger } from '@/domain/logger/logger.interface';
import { type UserSocket } from '@/domain/model/user';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';

export class RemoveUserFromRoomUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository) {}

  async execute(code: string, user: UserSocket): Promise<void> {
    const room = await this.roomRepository.getRoom(code);
    if (room.started) {
      return;
    }
    const users = room.users.filter(
      (element: UserSocket) => element.userId !== user.userId,
    );
    await this.roomRepository.setRoom(code, [
      'users', JSON.stringify(users),
    ]);
  }
}
