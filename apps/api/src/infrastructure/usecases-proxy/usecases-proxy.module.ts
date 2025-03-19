import { DynamicModule, forwardRef, Module } from '@nestjs/common';

import { ExceptionsModule } from '@/infrastructure/exceptions/exceptions.module';
import { LoggerModule } from '@/infrastructure/logger/logger.module';
import { LoggerService } from '@/infrastructure/logger/logger.service';
import { RepositoriesModule } from '@/infrastructure/repositories/repositories.module';
import { DatabaseRoomRepository } from '@/infrastructure/repositories/room.repositories';
import { DatabaseUserRepository } from '@/infrastructure/repositories/user.repository';
import { TranslationService } from '@/infrastructure/services/translation/translation.service';
import { UseCaseProxy } from '@/infrastructure/usecases-proxy/usecases-proxy';
import { AttackPlayerUseCases } from '@/usecases/game/attackPlayer.usecases';
import { CanUserPlayUseCases } from '@/usecases/game/canUserPlay.usecases';
import { ChooseGoldUseCases } from '@/usecases/game/chooseGold.usecases';
import { DestroyCardUseCases } from '@/usecases/game/destroyCard.usecases';
import { DiscardCardUseCases } from '@/usecases/game/discardCard.usecases';
import { DrawCardUseCases } from '@/usecases/game/drawCard.usecases';
import { GetBoardUseCases } from '@/usecases/game/getBoard.usecases';
import { GetCardsToRevealUseCases } from '@/usecases/game/getCardsToReveal.usecases';
import { GetDeckLengthUseCases } from '@/usecases/game/getDeckLength.usecases';
import { GetRoundUseCases } from '@/usecases/game/getRound.usecases';
import { GetUserChooseGoldUseCases } from '@/usecases/game/getUserChooseGold.usecases';
import { GetUserGameUseCases } from '@/usecases/game/getUserGame.usecases';
import { GoldPhaseUseCases } from '@/usecases/game/goldPhase.usecases';
import { IsNainWinUseCases } from '@/usecases/game/isNainWin.usecases';
import { IsSaboteurWinUseCases } from '@/usecases/game/isSaboteurWin.usecases';
import { NewRoundUseCases } from '@/usecases/game/newRound.usecases';
import { NextUserUseCases } from '@/usecases/game/nextUser.usecases';
import { PlaceCardUseCases } from '@/usecases/game/placeCard.usecases';
import { RepairlayerUseCases } from '@/usecases/game/repairPlayer.usecases';
import { RevealObjectiveUseCases } from '@/usecases/game/revealObjective.usecases';
import { StartGameUseCases } from '@/usecases/game/startGame.usecases';
import { AddUserToRoomUseCases } from '@/usecases/room/addUserToRoom.usecases';
import { CreateRoomUseCases } from '@/usecases/room/createRoom.usecases';
import { GameIsStartedUseCases } from '@/usecases/room/gameIsStarted.usecases';
import { GetCurrentRoundUserUseCases } from '@/usecases/room/getCurrentRoundUserUseCases.usecases';
import { GetRoomUseCases } from '@/usecases/room/getRoom.usecases';
import { GetRoomUsersUseCases } from '@/usecases/room/getRoomUsers.usecases';
import { GetSocketIdUseCases } from '@/usecases/room/getSocketId.usecases';
import { IsHostUseCases } from '@/usecases/room/isHost.usecases';
import { RemoveUserFromRoomUseCases } from '@/usecases/room/removeUserFromRoom.usecases';
import { AddUserUseCases } from '@/usecases/user/addUser.usecases';
import { CheckUnknownUserUseCases } from '@/usecases/user/checkUnknownUser.usecases';
import { DeleteUserByIdUseCases } from '@/usecases/user/deleteUser.usecases';
import { GetUserByEmailUseCases } from '@/usecases/user/getUserByEmail.usecases';
import { GetUserByIdUseCases } from '@/usecases/user/getUserById.usecases';
import { GetUsersUseCases } from '@/usecases/user/getUsers.usecases';
import { UpdateUserUseCases } from '@/usecases/user/updateUser.usecases';

@Module({
  imports: [LoggerModule, forwardRef(() => RepositoriesModule), ExceptionsModule],
  providers: [TranslationService],
})
export class UsecasesProxyModule {
  static GET_USER_BY_ID_USECASES_PROXY = 'getUserByIdUsecasesProxy';
  static GET_USER_BY_EMAIL_USECASES_PROXY = 'getUserByEmailUsecasesProxy';
  static GET_USERS_USESCASES_PROXY = "getUsersUsescasesProxy";
  static ADD_USER_USECASES_PROXY = 'addUserUsecasesProxy';
  static UPDATE_USER_USECASES_PROXY = "updateUserUsecasesProxy";
  static DELETE_USER_BY_ID_USECASES_PROXY = "deleteUserByIdUsecasesProxy";
  static CHECK_UNKNOWN_USER_USESCASES_PROXY = "checkUnknownUserUsecasesProxy";

  static CREATE_ROOM_USECASES_PROXY = "createRoomUseCasesProxy";
  static ADD_USER_TO_ROOM_USECASES_PROXY = "addUserToRoomUseCasesProxy";
  static REMOVE_USER_FROM_ROOM_USECASES_PROXY = "removeUserFromRoomUseCasesProxy";
  static GAME_IS_STARTED_USECASES_PROXY = "gameIsStartedUseCasesProxy";
  static GET_ROOM_USERS_USECASES_PROXY = "getRoomUsersUseCasesProxy";
  static IS_HOST_USECASES_PROXY = "isHostUseCasesProxy";
  static GET_SOCKET_ID_USECASES_PROXY = "getSocketIdUseCasesProxy";
  static GET_ROOM_USECASES_PROXY = "getRoomUseCasesProxy";
  static NEW_ROUND_USECASES_PROXY = "newRoundUseCasesProxy";
  static GET_CURRENT_ROUND_USER = "getCurrentRoundUserUseCases";

  static START_GAME_USECASES_PROXY = "startGameUseCasesProxy";
  static GET_ROUND_USECASES_PROXY = "getRoundUseCasesProxy";
  static GET_BOARD_USECASES_PROXY = "getBoardUseCasesProxy";
  static GET_USER_GAME_USECASES_PROXY = "getUserGameUseCasesProxy";
  static NEXT_USER_USECASES_PROXY = "NextUserUseCasesProxy";
  static ATTACK_PLAYER_USECASES_PROXY = "AttackPlayerUseCasesProxy";
  static CAN_USER_PLAY_USECASES_PROXY = "CanUserPlayUseCasesProxy";
  static DESTROY_CARD_USECASES_PROXY = "DestroyCardUseCasesProxy";
  static DISCARD_CARD_USECASES_PROXY = "DiscardCardUseCasesProxy";
  static DRAW_CARD_USECASES_PROXY = "DrawCardUseCasesProxy";
  static PLACE_CARD_USECASES_PROXY = "PlaceCardUseCasesProxy";
  static REPAIR_PLAYER_USECASES_PROXY = "RepairPlayerUseCasesProxy";
  static REVEAL_OBJECTIVE_CARD_USECASES_PROXY = "RevealObjectiveCardUseCasesProxy";
  static GET_DECK_LENGTH_USECASES_PROXY = "getDeckUseCasesProxy";
  static IS_SABOTEUR_WIN_USECASES_PROXY = "isSaboteurWinUseCasesProxy";
  static IS_NAIN_WIN_USECASES_PROXY = "isNainWinUseCasesProxy";
  static GOLD_PHASE_USECASES_PROXY = "goldPhaseUseCasesProxy";
  static CHOOSE_GOLD_USECASES_PROXY = "chooseGoldUseCasesProxy";
  static GET_CARDS_TO_REVEAL_USECASES_PROXY = "getCardsToRevealUseCasesProxy";
  static GET_USER_CHOOSE_GOLD_USECASES_PROXY = "getUserChooseGoldUseCasesProxy";

  static register(): DynamicModule {
    return {
      module: UsecasesProxyModule,
      providers: [
        {
          inject: [LoggerService, DatabaseUserRepository],
          provide: UsecasesProxyModule.GET_USER_BY_ID_USECASES_PROXY,
          useFactory: (logger: LoggerService, userRepository: DatabaseUserRepository) =>
            new UseCaseProxy(new GetUserByIdUseCases(logger, userRepository))
        },
        {
          inject: [LoggerService, DatabaseUserRepository],
          provide: UsecasesProxyModule.ADD_USER_USECASES_PROXY,
          useFactory: (logger: LoggerService, userRepository: DatabaseUserRepository) =>
            new UseCaseProxy(new AddUserUseCases(logger, userRepository))
        },
        {
          inject: [LoggerService, DatabaseUserRepository],
          provide: UsecasesProxyModule.GET_USER_BY_EMAIL_USECASES_PROXY,
          useFactory: (logger: LoggerService, userRepository: DatabaseUserRepository) =>
            new UseCaseProxy(new GetUserByEmailUseCases(logger, userRepository))
        },
        {
          inject: [LoggerService, DatabaseUserRepository],
          provide: UsecasesProxyModule.GET_USERS_USESCASES_PROXY,
          useFactory: (logger: LoggerService, userRepository: DatabaseUserRepository) =>
            new UseCaseProxy(new GetUsersUseCases(logger, userRepository))
        },
        {
          inject: [LoggerService, DatabaseUserRepository],
          provide: UsecasesProxyModule.UPDATE_USER_USECASES_PROXY,
          useFactory: (logger: LoggerService, userRepository: DatabaseUserRepository) =>
            new UseCaseProxy(new UpdateUserUseCases(logger, userRepository))
        },
        {
          inject: [LoggerService, DatabaseUserRepository],
          provide: UsecasesProxyModule.DELETE_USER_BY_ID_USECASES_PROXY,
          useFactory: (logger: LoggerService, userRepository: DatabaseUserRepository) =>
            new UseCaseProxy(new DeleteUserByIdUseCases(logger, userRepository))
        },
        {
          inject: [LoggerService, DatabaseUserRepository],
          provide: UsecasesProxyModule.CHECK_UNKNOWN_USER_USESCASES_PROXY,
          useFactory: (logger: LoggerService, userRepository: DatabaseUserRepository) =>
            new UseCaseProxy(new CheckUnknownUserUseCases(logger, userRepository))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository],
          provide: UsecasesProxyModule.CREATE_ROOM_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository) =>
            new UseCaseProxy(new CreateRoomUseCases(logger, roomRepository))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository],
          provide: UsecasesProxyModule.ADD_USER_TO_ROOM_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository, translationService: TranslationService) =>
            new UseCaseProxy(new AddUserToRoomUseCases(logger, roomRepository, translationService))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository],
          provide: UsecasesProxyModule.REMOVE_USER_FROM_ROOM_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository) =>
            new UseCaseProxy(new RemoveUserFromRoomUseCases(logger, roomRepository))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository],
          provide: UsecasesProxyModule.GAME_IS_STARTED_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository) =>
            new UseCaseProxy(new GameIsStartedUseCases(logger, roomRepository))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository],
          provide: UsecasesProxyModule.GET_ROOM_USERS_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository) =>
            new UseCaseProxy(new GetRoomUsersUseCases(logger, roomRepository))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository],
          provide: UsecasesProxyModule.IS_HOST_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository) =>
            new UseCaseProxy(new IsHostUseCases(logger, roomRepository))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository],
          provide: UsecasesProxyModule.GET_SOCKET_ID_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository) =>
            new UseCaseProxy(new GetSocketIdUseCases(logger, roomRepository))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository],
          provide: UsecasesProxyModule.GET_ROOM_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository) =>
            new UseCaseProxy(new GetRoomUseCases(logger, roomRepository))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository],
          provide: UsecasesProxyModule.NEW_ROUND_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository) =>
            new UseCaseProxy(new NewRoundUseCases(logger, roomRepository))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository, TranslationService],
          provide: UsecasesProxyModule.START_GAME_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository, translationService: TranslationService) =>
            new UseCaseProxy(new StartGameUseCases(logger, roomRepository, translationService))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository],
          provide: UsecasesProxyModule.GET_ROUND_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository) =>
            new UseCaseProxy(new GetRoundUseCases(logger, roomRepository))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository],
          provide: UsecasesProxyModule.GET_BOARD_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository) =>
            new UseCaseProxy(new GetBoardUseCases(logger, roomRepository))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository],
          provide: UsecasesProxyModule.GET_CURRENT_ROUND_USER,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository) =>
            new UseCaseProxy(new GetCurrentRoundUserUseCases(logger, roomRepository))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository, TranslationService],
          provide: UsecasesProxyModule.NEXT_USER_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository, translationService: TranslationService) =>
            new UseCaseProxy(new NextUserUseCases(logger, roomRepository, translationService))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository, TranslationService],
          provide: UsecasesProxyModule.ATTACK_PLAYER_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository, translationService: TranslationService) =>
            new UseCaseProxy(new AttackPlayerUseCases(logger, roomRepository, translationService))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository, TranslationService],
          provide: UsecasesProxyModule.CAN_USER_PLAY_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository, translationService: TranslationService) =>
            new UseCaseProxy(new CanUserPlayUseCases(logger, roomRepository, translationService))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository, TranslationService],
          provide: UsecasesProxyModule.DESTROY_CARD_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository, translationService: TranslationService) =>
            new UseCaseProxy(new DestroyCardUseCases(logger, roomRepository, translationService))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository, TranslationService],
          provide: UsecasesProxyModule.DISCARD_CARD_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository, translationService: TranslationService) =>
            new UseCaseProxy(new DiscardCardUseCases(logger, roomRepository, translationService))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository, TranslationService],
          provide: UsecasesProxyModule.DRAW_CARD_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository, translationService: TranslationService) =>
            new UseCaseProxy(new DrawCardUseCases(logger, roomRepository, translationService))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository, TranslationService],
          provide: UsecasesProxyModule.PLACE_CARD_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository, translationService: TranslationService) =>
            new UseCaseProxy(new PlaceCardUseCases(logger, roomRepository, translationService))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository, TranslationService],
          provide: UsecasesProxyModule.REPAIR_PLAYER_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository, translationService: TranslationService) =>
            new UseCaseProxy(new RepairlayerUseCases(logger, roomRepository, translationService))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository, TranslationService],
          provide: UsecasesProxyModule.REVEAL_OBJECTIVE_CARD_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository, translationService: TranslationService) =>
            new UseCaseProxy(new RevealObjectiveUseCases(logger, roomRepository, translationService))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository],
          provide: UsecasesProxyModule.GET_USER_GAME_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository) =>
            new UseCaseProxy(new GetUserGameUseCases(logger, roomRepository))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository],
          provide: UsecasesProxyModule.GET_CARDS_TO_REVEAL_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository) =>
            new UseCaseProxy(new GetCardsToRevealUseCases(logger, roomRepository))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository],
          provide: UsecasesProxyModule.GET_DECK_LENGTH_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository) =>
            new UseCaseProxy(new GetDeckLengthUseCases(logger, roomRepository))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository],
          provide: UsecasesProxyModule.IS_SABOTEUR_WIN_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository) =>
            new UseCaseProxy(new IsSaboteurWinUseCases(logger, roomRepository))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository],
          provide: UsecasesProxyModule.IS_NAIN_WIN_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository) =>
            new UseCaseProxy(new IsNainWinUseCases(logger, roomRepository))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository, TranslationService],
          provide: UsecasesProxyModule.GOLD_PHASE_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository, translationService: TranslationService) =>
            new UseCaseProxy(new GoldPhaseUseCases(logger, roomRepository, translationService))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository, TranslationService],
          provide: UsecasesProxyModule.CHOOSE_GOLD_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository, translationService: TranslationService) =>
            new UseCaseProxy(new ChooseGoldUseCases(logger, roomRepository, translationService))
        },
        {
          inject: [LoggerService, DatabaseRoomRepository, TranslationService],
          provide: UsecasesProxyModule.GET_USER_CHOOSE_GOLD_USECASES_PROXY,
          useFactory: (logger: LoggerService, roomRepository: DatabaseRoomRepository) =>
            new UseCaseProxy(new GetUserChooseGoldUseCases(logger, roomRepository))
        },
      ],
      exports: [
        UsecasesProxyModule.GET_USER_BY_ID_USECASES_PROXY,
        UsecasesProxyModule.GET_USER_BY_EMAIL_USECASES_PROXY,
        UsecasesProxyModule.GET_USERS_USESCASES_PROXY,
        UsecasesProxyModule.ADD_USER_USECASES_PROXY,
        UsecasesProxyModule.UPDATE_USER_USECASES_PROXY,
        UsecasesProxyModule.DELETE_USER_BY_ID_USECASES_PROXY,
        UsecasesProxyModule.CHECK_UNKNOWN_USER_USESCASES_PROXY,
        UsecasesProxyModule.CREATE_ROOM_USECASES_PROXY,
        UsecasesProxyModule.ADD_USER_TO_ROOM_USECASES_PROXY,
        UsecasesProxyModule.REMOVE_USER_FROM_ROOM_USECASES_PROXY,
        UsecasesProxyModule.GAME_IS_STARTED_USECASES_PROXY,
        UsecasesProxyModule.GET_SOCKET_ID_USECASES_PROXY,
        UsecasesProxyModule.GET_ROOM_USERS_USECASES_PROXY,
        UsecasesProxyModule.IS_HOST_USECASES_PROXY,
        UsecasesProxyModule.GET_ROOM_USECASES_PROXY,
        UsecasesProxyModule.START_GAME_USECASES_PROXY,
        UsecasesProxyModule.GET_ROUND_USECASES_PROXY,
        UsecasesProxyModule.GET_BOARD_USECASES_PROXY,
        UsecasesProxyModule.GET_USER_GAME_USECASES_PROXY,
        UsecasesProxyModule.NEXT_USER_USECASES_PROXY,
        UsecasesProxyModule.NEW_ROUND_USECASES_PROXY,
        UsecasesProxyModule.GET_CURRENT_ROUND_USER,
        UsecasesProxyModule.ATTACK_PLAYER_USECASES_PROXY,
        UsecasesProxyModule.CAN_USER_PLAY_USECASES_PROXY,
        UsecasesProxyModule.DESTROY_CARD_USECASES_PROXY,
        UsecasesProxyModule.DISCARD_CARD_USECASES_PROXY,
        UsecasesProxyModule.DRAW_CARD_USECASES_PROXY,
        UsecasesProxyModule.PLACE_CARD_USECASES_PROXY,
        UsecasesProxyModule.REPAIR_PLAYER_USECASES_PROXY,
        UsecasesProxyModule.REVEAL_OBJECTIVE_CARD_USECASES_PROXY,
        UsecasesProxyModule.GET_DECK_LENGTH_USECASES_PROXY,
        UsecasesProxyModule.IS_SABOTEUR_WIN_USECASES_PROXY,
        UsecasesProxyModule.IS_NAIN_WIN_USECASES_PROXY,
        UsecasesProxyModule.GOLD_PHASE_USECASES_PROXY,
        UsecasesProxyModule.CHOOSE_GOLD_USECASES_PROXY,
        UsecasesProxyModule.GET_CARDS_TO_REVEAL_USECASES_PROXY,
        UsecasesProxyModule.GET_USER_CHOOSE_GOLD_USECASES_PROXY,
      ],
    };
  }
}
