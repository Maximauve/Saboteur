import { type ILogger } from '@/domain/logger/logger.interface';
import { type Board } from '@/domain/model/board';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';

export class GetBoardUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository) {}

  async execute(code: string): Promise<Board> {
    return this.roomRepository.getBoard(code);
  }
}
