import { type ILogger } from '@/domain/logger/logger.interface';
import { type Move } from '@/domain/model/move';
import { type UserGame, type UserSocket } from '@/domain/model/user';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { type TranslationService } from '@/infrastructure/services/translation/translation.service';

export class CanUserPlayUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository, private readonly translationService: TranslationService) {}

  async execute(code: string, user: UserSocket, move: Move): Promise<boolean> {
    const round = await this.roomRepository.getRound(code);
    const realUser = round.users.find(userRound => userRound.userId === user.userId);
    if (!realUser) {
      throw new Error(await this.translationService.translate('error.USER_NOT_FOUND'));
    }
    if (realUser.hasToPlay === false) {
      throw new Error(await this.translationService.translate("error.NOT_YOUR_TURN"));
    }
    if (!move.card) {
      throw new Error(await this.translationService.translate("error.CARD_NOT_FOUND"));
    }
    if (!this.cardIsInDeck(move, realUser)) {
      throw new Error(await this.translationService.translate("error.CARD_NOT_IN_HAND"));
    }
    return true;
  }  

  private cardIsInDeck(move: Move, user: UserGame) {
    return user.cards.some(card => card.id === move.card.id);
  }
}

