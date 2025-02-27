import { type ILogger } from '@/domain/logger/logger.interface';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';

export class GetSocketIdUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository) {}

  async execute(code: string, userId: string): Promise<string | undefined> {
    return this.roomRepository.getSocketId(code, userId);
  }
}
