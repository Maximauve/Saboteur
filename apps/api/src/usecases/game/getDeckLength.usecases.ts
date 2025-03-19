import { type ILogger } from '@/domain/logger/logger.interface';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';

export class GetDeckLengthUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository) {}

  async execute(code: string): Promise<number> {
    const deck = await this.roomRepository.getDeck(code);
    return deck.length;
  }
}
