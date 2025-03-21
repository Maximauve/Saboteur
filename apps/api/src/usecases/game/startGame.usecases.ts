
import { type ILogger } from '@/domain/logger/logger.interface';
import { GoldDeck } from '@/domain/model/gold-deck';
import { type UserSocket } from '@/domain/model/user';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { type TranslationService } from '@/infrastructure/services/translation/translation.service';

export class StartGameUseCases {
  constructor(
    private readonly logger: ILogger,
    private readonly roomRepository: RoomRepository,
    private readonly translationService: TranslationService,
  ) {}

  async execute(code: string, user: UserSocket): Promise<void> {
    const room = await this.roomRepository.getRoom(code);
    if (room.host.userId !== user.userId) {
      throw new Error(await this.translationService.translate("error.NOT_HOST"));
    }
    if (room.started) {
      throw new Error(await this.translationService.translate("error.ROOM_ALREADY_STARTED"));
    }
    if (room.users.length < 3) {
      throw new Error(await this.translationService.translate("error.ROOM_MIN"));
    }
    let goldDeck = new GoldDeck().getDeck();
    goldDeck = this.shuffleArray(goldDeck);
    await this.roomRepository.setRoom(code, ['started', 'true', 'goldDeck', JSON.stringify(goldDeck)]);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let index = shuffled.length - 1; index > 0; index--) {
      const secondIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[secondIndex]] = [shuffled[secondIndex], shuffled[index]];
    }
    return shuffled;
  }
}
