import { type ILogger } from '@/domain/logger/logger.interface';
import { type Message } from '@/domain/model/websocket';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';

export class AddRoomMessageUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository) {}

  async execute(code: string, message: Message): Promise<void> {
    const room = await this.roomRepository.getRoom(code);
    room.messages.push(message);
    await this.roomRepository.setRoom(code, [
      'messages', JSON.stringify(room.messages)
    ]);
  }
}
