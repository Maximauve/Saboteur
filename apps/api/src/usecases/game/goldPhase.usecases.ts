import { type ILogger } from '@/domain/logger/logger.interface';
import { type UserSocket } from '@/domain/model/user';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { type TranslationService } from '@/infrastructure/services/translation/translation.service';

export class GoldPhaseUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository, private readonly translationService: TranslationService) {}

  async execute(code: string, user: UserSocket, isSaboteurWin: boolean): Promise<void> {
    const round = await this.roomRepository.getRound(code);
    const realUser = round.users.find(userRound => userRound.userId === user.userId);
    if (!realUser) {
      throw new Error(await this.translationService.translate("error.USER_NOT_FOUND"));
    }

    if (!round.goldList) {
      round.goldList = [];
    }
    
    const eligibleUsers = round.users.filter(roundUser => 
      isSaboteurWin ? roundUser.isSaboteur : !roundUser.isSaboteur
    );

    if (eligibleUsers.length === 0) {
      throw new Error(await this.translationService.translate("error.USER_NOT_FOUND"));
    }

    round.goldList = eligibleUsers;
    
    if (round.goldList.length > 0) {
      const firstEligibleUser = eligibleUsers[0];
      const userIndex = round.users.findIndex(u => u.userId === firstEligibleUser.userId);
      if (userIndex !== -1) {
        round.users[userIndex].hasToChooseGold = true;
      }
    }

    await this.roomRepository.setRound(code, round.index, [
      'chooseGoldTime',
      JSON.stringify(true),
      'goldList',
      JSON.stringify(round.goldList),
      'users',
      JSON.stringify(round.users),
    ]);
  }
}
