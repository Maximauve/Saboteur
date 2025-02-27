import { type ILogger } from '@/domain/logger/logger.interface';
import { type Room } from '@/domain/model/room';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';

export class GetRoomUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository) {}

  async execute(code: string): Promise<Room> {
    return this.roomRepository.getRoom(code);
  }
}
