import { type ILogger } from '@/domain/logger/logger.interface';
import { type Room } from '@/domain/model/room';
import { type UserFromRequest } from '@/domain/model/user';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';

export class CreateRoomUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository) {}

  async execute(user: UserFromRequest): Promise<Room> {
    return this.roomRepository.createRoom(user);
  }
}
