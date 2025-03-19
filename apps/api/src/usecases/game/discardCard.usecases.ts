import { type ILogger } from '@/domain/logger/logger.interface';
import { type Move } from '@/domain/model/move';
import { type UserSocket } from '@/domain/model/user';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { type TranslationService } from '@/infrastructure/services/translation/translation.service';

export class DiscardCardUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository, private readonly translationService: TranslationService) {}

  async execute(code: string, user: UserSocket, move: Move): Promise<void> {
    const round = await this.roomRepository.getRound(code);
    const realUser = round.users.find(userRound => userRound.userId === user.userId)!;
    realUser.cards = realUser.cards.filter(card => card.id !== move.card.id);

    await this.roomRepository.setRound(code, round.index, [
      'board', JSON.stringify(round.board),
      'users', JSON.stringify(round.users),
      'deck' , JSON.stringify(round.deck)
    ]);
  }
}

