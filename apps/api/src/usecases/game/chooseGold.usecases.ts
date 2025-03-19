import { type ILogger } from '@/domain/logger/logger.interface';
import { type UserSocket } from '@/domain/model/user';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { type TranslationService } from '@/infrastructure/services/translation/translation.service';

export class ChooseGoldUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository, private readonly translationService: TranslationService) {}

  async execute(code: string, user: UserSocket, nbGold: number): Promise<number[]> {
    const room = await this.roomRepository.getRoom(code);
    const round = await this.roomRepository.getRound(code);
    const userIndex = round.users.findIndex(roundUser => roundUser.userId === user.userId);
    const roomUser = room.users.find(roomU => roomU.userId === user.userId);
    if (userIndex === -1 || !roomUser) {
      throw new Error(await this.translationService.translate("error.USER_NOT_FOUND"));
    }
    const realUser = round.users[userIndex];
    
    if (!realUser.hasToChooseGold) {
      throw new Error(await this.translationService.translate("error.NOT_CHOOSE_GOLD"));
    }
    
    const goldIndex = round.goldList.indexOf(nbGold);
    if (goldIndex === -1) {
      throw new Error(await this.translationService.translate("error.NOT_GOOD_NB_GOLD"));
    }
    roomUser.gold += nbGold;
    round.goldList.splice(goldIndex, 1);
    realUser.hasToChooseGold = false;
    
    if (round.goldList.length > 0) {      
      const totalUsers = round.users.length;
      let nextIndex = (userIndex - 1 + totalUsers) % totalUsers;
      for (let index = 0; index < totalUsers; index++) {
        if (!round.users[nextIndex].isSaboteur) {
          round.users[nextIndex].hasToChooseGold = true;
          break;
        }
        nextIndex = (nextIndex - 1 + totalUsers) % totalUsers;
      }
    }
    
    await this.roomRepository.setRoom(code, [
      'users',
      JSON.stringify(room.users),
    ]);

    await this.roomRepository.setRound(code, round.index, [
      'goldList',
      JSON.stringify(round.goldList),
      'users',
      JSON.stringify(round.users),
    ]);
    return round.goldList;
  }
}
