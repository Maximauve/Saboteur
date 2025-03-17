import { type ILogger } from '@/domain/logger/logger.interface';
import { type UserSocket } from '@/domain/model/user';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { type TranslationService } from '@/infrastructure/services/translation/translation.service';

export class AddUserToRoomUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository, private readonly translationService: TranslationService) {}

  async execute(code: string, user: UserSocket): Promise<void> {
    const room = await this.roomRepository.getRoom(code);
    if (
      room.started === true &&
      !room.users.some((element: UserSocket) => user.userId === element.userId)
    ) {
      throw new Error(await this.translationService.translate("error.ROOM_ALREADY_STARTED"));
    }
    if (
      room.users.length >= 10 &&
      !room.users.some((element: UserSocket) => user.userId === element.userId)
    ) {
      throw new Error(await this.translationService.translate("error.ROOM_MAX"));
    }
    if (room.host.userId === user.userId) {
      const host = room.users.find((element: UserSocket) => element.userId === user.userId);
      if (host) {
        host.socketId = user.socketId;
        host.isHost = true;
      } else {
        user.isHost = true;
        room.users.push(user);
      }
      await this.roomRepository.setRoom(code, [
        'hosts', JSON.stringify(user),
        'users', JSON.stringify(room.users),
      ]);
    } else if (
      room.users.some((element: UserSocket) => element.userId === user.userId)
    ) {
      const existingUser = room.users.find((element: UserSocket) => element.userId === user.userId);
      if (existingUser) {
        existingUser.socketId = user.socketId;
      }
      await this.roomRepository.setRoom(code, [
        'users', JSON.stringify(room.users)
      ]);
    } else {
      await this.roomRepository.setRoom(code, [
        'users', JSON.stringify([...room.users, user]),
      ]);
    }
  }
}
