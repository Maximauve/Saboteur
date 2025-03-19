import { type ILogger } from '@/domain/logger/logger.interface';
import { type Board } from '@/domain/model/board';
import { CardType } from '@/domain/model/card';
import { type Move, type PlacedMove } from '@/domain/model/move';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { type TranslationService } from '@/infrastructure/services/translation/translation.service';

export class DestroyCardUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository, private readonly translationService: TranslationService) {}

  async execute(code: string, move: Move): Promise<void> {
    const round = await this.roomRepository.getRound(code);
    if (!this.isPlacementValid(round.board, move)) {
      throw new Error(await this.translationService.translate("error.CARD_CANNOT_BE_PLACED"));
    }
    round.board.grid[move.x][move.y] = null;

    await this.roomRepository.setRound(code, round.index, [
      'board', JSON.stringify(round.board),
      'users', JSON.stringify(round.users),
      'deck' , JSON.stringify(round.deck)
    ]);
  }

  private isPlacementValid(board: Board, move: Move): move is PlacedMove {
    if (move.x === undefined || move.y === undefined) {
      return false;
    }
    const card = board.grid[move.x][move.y];
    if (card === null) {
      return false;
    }

    if (card.type === CardType.START || card.type === CardType.END_HIDDEN) {
      return false;
    }

    return true;
  }
}

