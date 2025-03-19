import { type ILogger } from '@/domain/logger/logger.interface';
import { type Message } from '@/domain/model/websocket';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';

export class GetRoomMessagesUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository) {}

  async execute(code: string): Promise<Message[]> {
    const room = await this.roomRepository.getRoom(code);
    return room.messages;
  }
}
