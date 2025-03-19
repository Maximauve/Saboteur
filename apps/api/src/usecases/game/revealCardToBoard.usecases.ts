import { type ILogger } from '@/domain/logger/logger.interface';
import { type ObjectiveCard } from '@/domain/model/card';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';

export class IsNainWinUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository) {}

  execute(revealedCards: ObjectiveCard[]): boolean {
    return revealedCards.some(card => card.type === 'TREASURE');
  }
}
