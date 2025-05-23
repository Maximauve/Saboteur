import { type ILogger } from '@/domain/logger/logger.interface';
import { type Move, type PlacedMove } from '@/domain/model/move';
import { type UserSocket } from '@/domain/model/user';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { type TranslationService } from '@/infrastructure/services/translation/translation.service';

export class RevealObjectiveUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository, private readonly translationService: TranslationService) {}

  async execute(code: string, user: UserSocket, move: Move): Promise<void> {
    const round = await this.roomRepository.getRound(code);

    const revealedObjective = round.objectiveCards.find(
      objectiveCard => objectiveCard.x === move.x && objectiveCard.y === move.y
    );
    if (!revealedObjective) {
      throw new Error(await this.translationService.translate('error.NO_OBJECTIVE_CARD_AT_POSITION'));
    }
    if (!this.isMoveValid(move)){
      throw new Error(await this.translationService.translate('error.INVALID_MOVE'));
    }

    const myUser = round.users.find(userRound => userRound.userId === user.userId)!;

    myUser.cardsRevealed.push({
      ...revealedObjective,
      x: move.x, 
      y: move.y
    });

    await this.roomRepository.setRound(code, round.index, [
      'board', JSON.stringify(round.board),
      'users', JSON.stringify(round.users),
      'deck' , JSON.stringify(round.deck)
    ]);
    
  }

  private isMoveValid(move: Move) : move is PlacedMove {
    if (move.x === undefined || move.y === undefined) {
      return false;
    }
    return true;
  }
}

