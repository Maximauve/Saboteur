import { type ILogger } from '@/domain/logger/logger.interface';
import { type UserSocket } from '@/domain/model/user';
import { type RoomRepository } from '@/domain/repositories/roomRepository.interface';
import { type TranslationService } from '@/infrastructure/services/translation/translation.service';

export class GoldPhaseUseCases {
  constructor(private readonly logger: ILogger, private readonly roomRepository: RoomRepository, private readonly translationService: TranslationService) {}

  async execute(code: string, user: UserSocket, isSaboteurWin: boolean): Promise<void> {
    const room = await this.roomRepository.getRoom(code);
    const round = await this.roomRepository.getRound(code);
    const realUserIndex = round.users.findIndex(userRound => userRound.userId === user.userId);
    if (realUserIndex === -1) {
      throw new Error(await this.translationService.translate("error.USER_NOT_FOUND"));
    }
    
    const realUser = round.users[realUserIndex];

    if (!round.goldList) {
      round.goldList = [];
    }

    if (isSaboteurWin) {
      round.users?.filter(roundUser => roundUser.isSaboteur).map(saboteurUser => saboteurUser.gold += this.saboteurCountGold(round?.users?.length));
    }  else {
      const numberPlayers = round.users.length;
        
      if (!room.goldDeck || room.goldDeck.length < numberPlayers) {
        throw new Error(await this.translationService.translate("error.NOT_ENOUGH_GOLD"));
      }
        
      round.goldList = room.goldDeck.slice(0, numberPlayers);
      room.goldDeck = room.goldDeck.slice(numberPlayers);

      let firstDwarfIndex = -1;
      
      if (realUser.isSaboteur) {
        const totalUsers = round.users.length;
        let currentIndex = (realUserIndex - 1 + totalUsers) % totalUsers;
        
        while (currentIndex !== realUserIndex) {
          if (!round.users[currentIndex].isSaboteur) {
            firstDwarfIndex = currentIndex;
            break;
          }
          currentIndex = (currentIndex - 1 + totalUsers) % totalUsers;
        }
      } else {
        firstDwarfIndex = realUserIndex;
      }

      if (firstDwarfIndex === -1) {
        throw new Error(await this.translationService.translate("error.USER_NOT_FOUND"));
      } else {
        round.users[firstDwarfIndex].hasToChooseGold = true;
      }
    }

    await this.roomRepository.setRoom(code, [
      'goldDeck',
      JSON.stringify(room.goldDeck)
    ]);

    await this.roomRepository.setRound(code, round.index, [
      'goldList',
      JSON.stringify(round.goldList),
      'users',
      JSON.stringify(round.users),
    ]);
  }
  
  private saboteurCountGold(nbSaboteur: number) {
    switch (nbSaboteur) {
      case 1: {
        return 4;
      }
      case 2:
      case 3: {
        return 3;
      }
      case 4: {
        return 2;
      }
      default: {
        return 2;
      }
    }
  }
}