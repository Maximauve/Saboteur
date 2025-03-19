import { type ILogger } from '@/domain/logger/logger.interface';
import { type Card, CardType } from '@/domain/model/card';
import { type Move } from '@/domain/model/move';
import { type UserGame } from '@/domain/model/user';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { type TranslationService } from '@/infrastructure/services/translation/translation.service';

export class RepairlayerUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository, private readonly translationService: TranslationService) {}

  async execute(code: string, move: Move): Promise<void> {
    if (!move.userReceiver) {
      throw new Error(await this.translationService.translate('error.USER_NOT_FOUND'));
    }
  
    const round = await this.roomRepository.getRound(code);
    const receiver = round.users.find(roundUser => roundUser.userId === move.userReceiver?.userId);
    if (!receiver) {
      throw new Error(await this.translationService.translate('error.USER_NOT_FOUND'));
    }

    if (move.targettedMalusCard?.type !== CardType.BROKEN_TOOL) {
      throw new Error(await this.translationService.translate('error.CARD_NOT_BROKEN_TOOL'));
    }

    if (!this.toolAlreadyBroken(move.card, receiver)) {
      throw new Error(await this.translationService.translate('error.TOOL_NOT_BROKEN'));
    }


    const toolToRepair = move.targettedMalusCard.tools[0];
    if (!move.card.tools.includes(toolToRepair)) {
      throw new Error(await this.translationService.translate('error.CARD_CANT_REPAIR_THIS_TOOL'));
    }

    receiver.malus = receiver.malus.filter(malusCard => {
      return !malusCard.tools.includes(toolToRepair);
    });

    await this.roomRepository.setRound(code, round.index, [
      'board', JSON.stringify(round.board),
      'users', JSON.stringify(round.users),
      'deck' , JSON.stringify(round.deck)
    ]);
    
  }

  private toolAlreadyBroken(card: Card, user: UserGame): boolean {
    const alreadyBrokenTools = new Set(user.malus
      .flatMap(malusCard => malusCard.tools)
      .filter(Boolean));
  
    const isToolAlreadyBroken = card.tools.some(tool => 
      alreadyBrokenTools.has(tool)
    );
  
    return isToolAlreadyBroken;
  }


}

