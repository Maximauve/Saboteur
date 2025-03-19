import { Inject } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Socket } from "socket.io";

import { CardType } from '@/domain/model/card';
import { Move } from '@/domain/model/move';
import { UserGame, UserSocket } from '@/domain/model/user';
import { Message, WebsocketEvent } from '@/domain/model/websocket';
import { RedisService } from '@/infrastructure/services/redis/service/redis.service';
import { TranslationService } from '@/infrastructure/services/translation/translation.service';
import { UseCaseProxy } from '@/infrastructure/usecases-proxy/usecases-proxy';
import { UsecasesProxyModule } from '@/infrastructure/usecases-proxy/usecases-proxy.module';
import { AttackPlayerUseCases } from '@/usecases/game/attackPlayer.usecases';
import { CanUserPlayUseCases } from '@/usecases/game/canUserPlay.usecases';
import { DestroyCardUseCases } from '@/usecases/game/destroyCard.usecases';
import { DiscardCardUseCases } from '@/usecases/game/discardCard.usecases';
import { DrawCardUseCases } from '@/usecases/game/drawCard.usecases';
import { GetBoardUseCases } from '@/usecases/game/getBoard.usecases';
import { GetDeckLengthUseCases } from '@/usecases/game/getDeckLength.usecases';
import { GetRoundUseCases } from '@/usecases/game/getRound.usecases';
import { IsNainWinUseCases } from '@/usecases/game/isNainWin.usecases';
import { IsSaboteurWinUseCases } from '@/usecases/game/isSaboteurWin.usecases';
import { NewRoundUseCases } from '@/usecases/game/newRound.usecases';
import { NextUserUseCases } from '@/usecases/game/nextUser.usecases';
import { PlaceCardUseCases } from '@/usecases/game/placeCard.usecases';
import { RepairlayerUseCases } from '@/usecases/game/repairPlayer.usecases';
import { RevealObjectiveUseCases } from '@/usecases/game/revealObjective.usecases';
import { StartGameUseCases } from '@/usecases/game/startGame.usecases';
import { AddUserToRoomUseCases } from '@/usecases/room/addUserToRoom.usecases';
import { GameIsStartedUseCases } from '@/usecases/room/gameIsStarted.usecases';
import { GetCurrentRoundUserUseCases } from '@/usecases/room/getCurrentRoundUserUseCases.usecases';
import { GetRoomUsersUseCases } from '@/usecases/room/getRoomUsers.usecases';
import { GetSocketIdUseCases } from '@/usecases/room/getSocketId.usecases';
import { IsHostUseCases } from '@/usecases/room/isHost.usecases';
import { RemoveUserFromRoomUseCases } from '@/usecases/room/removeUserFromRoom.usecases';

@WebSocketGateway({ cors: { origin: '*', credentials: true }, namespace: 'room' })
export class RoomWebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {

  constructor(
    @Inject(UsecasesProxyModule.ADD_USER_TO_ROOM_USECASES_PROXY)
    private readonly addUserToRoomUseCase: UseCaseProxy<AddUserToRoomUseCases>,
    @Inject(UsecasesProxyModule.IS_HOST_USECASES_PROXY)
    private readonly isHostUseCase: UseCaseProxy<IsHostUseCases>,
    @Inject(UsecasesProxyModule.REMOVE_USER_FROM_ROOM_USECASES_PROXY)
    private readonly removeUserFromRoomUseCase: UseCaseProxy<RemoveUserFromRoomUseCases>,
    @Inject(UsecasesProxyModule.GAME_IS_STARTED_USECASES_PROXY)
    private readonly gameIsStartedUseCase: UseCaseProxy<GameIsStartedUseCases>,
    @Inject(UsecasesProxyModule.GET_ROOM_USERS_USECASES_PROXY)
    private readonly getRoomUsersUseCase: UseCaseProxy<GetRoomUsersUseCases>,
    @Inject(UsecasesProxyModule.GET_SOCKET_ID_USECASES_PROXY)
    private readonly getSocketIdUseCase: UseCaseProxy<GetSocketIdUseCases>,
    @Inject(UsecasesProxyModule.START_GAME_USECASES_PROXY)
    private readonly startGameUseCases: UseCaseProxy<StartGameUseCases>,
    @Inject(UsecasesProxyModule.GET_BOARD_USECASES_PROXY)
    private readonly getBoardUseCases: UseCaseProxy<GetBoardUseCases>,
    @Inject(UsecasesProxyModule.NEXT_USER_USECASES_PROXY)
    private readonly nextPlayerUseCases: UseCaseProxy<NextUserUseCases>,
    @Inject(UsecasesProxyModule.ATTACK_PLAYER_USECASES_PROXY)
    private readonly attackPlayerUseCases: UseCaseProxy<AttackPlayerUseCases>,
    @Inject(UsecasesProxyModule.CAN_USER_PLAY_USECASES_PROXY)
    private readonly canUserPlayUseCases: UseCaseProxy<CanUserPlayUseCases>,
    @Inject(UsecasesProxyModule.DESTROY_CARD_USECASES_PROXY)
    private readonly destroyCardUseCases: UseCaseProxy<DestroyCardUseCases>,
    @Inject(UsecasesProxyModule.DISCARD_CARD_USECASES_PROXY)
    private readonly discardCardUseCases: UseCaseProxy<DiscardCardUseCases>,
    @Inject(UsecasesProxyModule.DRAW_CARD_USECASES_PROXY)
    private readonly drawCardUseCases: UseCaseProxy<DrawCardUseCases>,
    @Inject(UsecasesProxyModule.PLACE_CARD_USECASES_PROXY)
    private readonly placeCardUseCases: UseCaseProxy<PlaceCardUseCases>,
    @Inject(UsecasesProxyModule.REPAIR_PLAYER_USECASES_PROXY)
    private readonly repairPlayerUseCases: UseCaseProxy<RepairlayerUseCases>,
    @Inject(UsecasesProxyModule.REVEAL_OBJECTIVE_CARD_USECASES_PROXY)
    private readonly revealObjectiveUseCases: UseCaseProxy<RevealObjectiveUseCases>,
    @Inject(UsecasesProxyModule.NEW_ROUND_USECASES_PROXY)
    private readonly newsRoundUseCases: UseCaseProxy<NewRoundUseCases>,
    @Inject(UsecasesProxyModule.GET_CURRENT_ROUND_USER)
    private readonly getCurrentRoundUserUseCases: UseCaseProxy<GetCurrentRoundUserUseCases>,
    @Inject(UsecasesProxyModule.GET_DECK_LENGTH_USECASES_PROXY)
    private readonly getDeckLengthUseCases: UseCaseProxy<GetDeckLengthUseCases>,
    @Inject(UsecasesProxyModule.GET_ROUND_USECASES_PROXY)
    private readonly getRoundUseCases: UseCaseProxy<GetRoundUseCases>,
    @Inject(UsecasesProxyModule.IS_SABOTEUR_WIN_USECASES_PROXY)
    private readonly isSaboteurWinUseCases: UseCaseProxy<IsSaboteurWinUseCases>,
    @Inject(UsecasesProxyModule.IS_NAIN_WIN_USECASES_PROXY)
    private readonly isNainWinUseCases: UseCaseProxy<IsNainWinUseCases>,
    private readonly redisService: RedisService,
    private readonly translationService: TranslationService
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @WebSocketServer() server: any;

  handleConnection(socket: Socket): void {
    const socketId = socket.id;
    socket.data.user = {
      socketId: socketId,
      userId: socket.handshake.query.userId,
      username: socket.handshake.query.username,
      gold: 0,
      ready: false,
      isHost: false,
    };
    socket.data.code = socket.handshake.query.code as string;
    console.log(`New connecting... socket id:`, socketId);
  }

  handleDisconnect(socket: Socket): void {
    console.log(`Disconnecting... socket id:`, socket.id);
  }

  @SubscribeMessage(WebsocketEvent.JOIN_ROOM)
  async joinRoom(@ConnectedSocket() client: Socket): Promise<unknown> {
    return this.handleAction(client.data.code as string, async () => {
      await this.addUserToRoomUseCase.getInstance().execute(client.data.code as string, client.data.user as UserSocket);
      client.join(client.data.code as string);
      const members = await this.getRoomUsersUseCase.getInstance().execute(client.data.code as string);
      if (await this.gameIsStartedUseCase.getInstance().execute(client.data.code as string)) {
        await this.server.to(client.data.user.socketId).emit(WebsocketEvent.GAME_IS_STARTED, true);
        await this.server.to(client.data.user.socketId).emit(WebsocketEvent.BOARD, await this.getBoardUseCases.getInstance().execute(client.data.code as string));
        const currentUser = await this.getCurrentRoundUserUseCases.getInstance().execute(client.data.code as string, client.data.user.userId as string);
        if (currentUser !== null) {
          this.server.to(client.data.user.socketId).emit(WebsocketEvent.USER, currentUser);
        }
      } else {
        members.forEach((member) => {
          this.server.to(member.socketId).emit(WebsocketEvent.USER, member);
        });
      }
      await this.server.to(client.data.code).emit(WebsocketEvent.MEMBERS, await this.getRoomUsersUseCase.getInstance().execute(client.data.code as string));
      return {
        gameIsStarted: await this.gameIsStartedUseCase.getInstance().execute(client.data.code as string)
      };
    });
  }

  @SubscribeMessage(WebsocketEvent.LEAVE_ROOM)
  async leaveRoom(@ConnectedSocket() client: Socket): Promise<unknown> {
    return this.handleAction(client.data.code as string, async () => {
      await this.removeUserFromRoomUseCase.getInstance().execute(client.data.code as string, client.data.user as UserSocket);
      await this.server.to(client.data.code).emit(WebsocketEvent.MEMBERS, await this.getRoomUsersUseCase.getInstance().execute(client.data.code as string));
    });
  }

  @SubscribeMessage(WebsocketEvent.CHAT)
  chat(@ConnectedSocket() client: Socket, @MessageBody() message: Message) {
    this.server.to(client.data.code).emit(WebsocketEvent.CHAT, message, client.data.user);
    return;
  }

  @SubscribeMessage(WebsocketEvent.REMOVE_USER)
  kickUser(@ConnectedSocket() client: Socket, @MessageBody() user: UserSocket) {
    return this.handleAction(client.data.code as string, async () => {
      if (!(await this.isHostUseCase.getInstance().execute(client.data.code as string, client.data.user as UserSocket))) {
        throw new Error(await this.translationService.translate("error.NOT_HOST"));
      }
      await this.server.to(await this.getSocketIdUseCase.getInstance().execute(client.data.code as string, user.userId)).emit(WebsocketEvent.REMOVE_USER); // envoie de l'evenement "REMOVE USER" à tout le monde
      await this.removeUserFromRoomUseCase.getInstance().execute(client.data.code as string, client.data.user as UserSocket);
      await this.server.to(client.data.code).emit(WebsocketEvent.MEMBERS, await this.getRoomUsersUseCase.getInstance().execute(client.data.code as string)); // envoie la liste des membres mise à jour
      return;
    });
  }

  @SubscribeMessage(WebsocketEvent.START_GAME)
  async startGame(@ConnectedSocket() client: Socket): Promise<unknown> {
    return this.handleAction(client.data.code as string, async () => {
      if (!(await this.isHostUseCase.getInstance().execute(client.data.code as string, client.data.user as UserSocket))) {
        throw new Error(await this.translationService.translate("error.NOT_HOST"));
      }
      await this.startGameUseCases.getInstance().execute(client.data.code as string, client.data.user as UserSocket);
      const users = await this.newsRoundUseCases.getInstance().execute(client.data.code as string);
      for (const user of users) {
        this.server.to(user.socketId).emit(WebsocketEvent.USER, user);
      }
      await this.server.to(client.data.code).emit(WebsocketEvent.DECK, await this.getDeckLengthUseCases.getInstance().execute(client.data.code as string));
      await this.server.to(client.data.code).emit(WebsocketEvent.BOARD, await this.getBoardUseCases.getInstance().execute(client.data.code as string));
      await this.server.to(client.data.code).emit(WebsocketEvent.MEMBERS, await this.getRoomUsersUseCase.getInstance().execute(client.data.code as string));
      await this.server.to(client.data.code).emit(WebsocketEvent.GAME_IS_STARTED, true);
    });
  }

  @SubscribeMessage(WebsocketEvent.PLAY)
  async play(@ConnectedSocket() client: Socket, @MessageBody() move: Move): Promise<unknown> {
    return this.handleAction(client.data.code as string, async () => {

      const { result: canPlay, error } = await this.canUserPlayUseCases.getInstance().execute(client.data.code as string, client.data.user as UserSocket, move);
      if (!canPlay) {
        throw new Error(error);
      }
      if (!move.discard) {
        await this.handlePlayedCard(client.data.code as string, client.data.user as UserGame, move);
      }
      await this.discardCardUseCases.getInstance().execute(client.data.code as string, client.data.user as UserGame, move);
      await this.drawCardUseCases.getInstance().execute(client.data.code as string, client.data.user as UserSocket);
      if (await this.isSaboteurWinUseCases.getInstance().execute(client.data.code as string)) {        
        // donner les pépites
        await this.newsRoundUseCases.getInstance().execute(client.data.code as string);
        return;
      } else if (await this.isNainWinUseCases.getInstance().execute(client.data.code as string)) {
        // donner les pépites
        await this.newsRoundUseCases.getInstance().execute(client.data.code as string);
        return;
      }
      await this.server.to(client.data.code).emit(WebsocketEvent.DECK, await this.getDeckLengthUseCases.getInstance().execute(client.data.code as string));
      await this.server.to(client.data.code).emit(WebsocketEvent.BOARD, await this.getBoardUseCases.getInstance().execute(client.data.code as string));
      await this.nextPlayerUseCases.getInstance().execute(client.data.code as string, client.data.user as UserSocket);
      const round = await this.getRoundUseCases.getInstance().execute(client.data.code as string);
      if (round) {
        round.users.forEach((member) => {
          this.server.to(member.socketId).emit(WebsocketEvent.USER, member);
        });
      }
      await this.server.to(client.data.code).emit(WebsocketEvent.MEMBERS, await this.getRoomUsersUseCase.getInstance().execute(client.data.code as string));
    });
  }

  async handlePlayedCard(code: string, user: UserGame, move: Move): Promise<void> {
    switch (move.card.type) {
      case CardType.BROKEN_TOOL: {
        return this.attackPlayerUseCases.getInstance().execute(code, move);
      }
      case CardType.COLLAPSE: {
        return this.destroyCardUseCases.getInstance().execute(code, move);
      }
      case CardType.DEADEND:
      case CardType.PATH: {
        return this.placeCardUseCases.getInstance().execute(code, move);
      }
      case CardType.INSPECT: {
        return this.revealObjectiveUseCases.getInstance().execute(code, user, move);
      }
      case CardType.REPAIR_DOUBLE:
      case CardType.REPAIR_TOOL: {
        return this.repairPlayerUseCases.getInstance().execute(code, move);
      }
    }
  }

  async handleAction(code: string, callback: () => Promise<unknown>): Promise<unknown> {
    try {
      if (await this.redisService.exists(`room:${code}`)) {
        return await callback();
      } else {
        throw new Error(await this.translationService.translate("error.ROOM_NOT_FOUND"));
      }
    } catch (error: unknown) {
      return error instanceof Error ? {
        error: error.message,
      } : {
        error: String(error),
      };
    }
  }
}

// function delay(ms: number) {
//   return new Promise( resolve => setTimeout(resolve, ms) );
// }
