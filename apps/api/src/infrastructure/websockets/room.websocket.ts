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

import { UserGame, UserSocket } from '@/domain/model/user';
import { Message, WebsocketEvent } from '@/domain/model/websocket';
import { RedisService } from '@/infrastructure/services/redis/service/redis.service';
import { TranslationService } from '@/infrastructure/services/translation/translation.service';
import { UseCaseProxy } from '@/infrastructure/usecases-proxy/usecases-proxy';
import { UsecasesProxyModule } from '@/infrastructure/usecases-proxy/usecases-proxy.module';
import { GetBoardUseCases } from '@/usecases/game/getBoard.usecases';
import { StartGameUseCases } from '@/usecases/game/startGame.usecases';
import { AddUserToRoomUseCases } from '@/usecases/room/addUserToRoom.usecases';
import { GameIsStartedUseCases } from '@/usecases/room/gameIsStarted.usecases';
import { GetRoomUsersUseCases } from '@/usecases/room/getRoomUsers.usecases';
import { GetSocketIdUseCases } from '@/usecases/room/getSocketId.usecases';
import { IsHostUseCases } from '@/usecases/room/isHost.usecases';
import { RemoveUserToRoomUseCases } from '@/usecases/room/removeUserToRoom.usecases';

@WebSocketGateway({ cors: { origin: '*', credentials: true }, namespace: 'room' })
export class RoomWebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {

  constructor(
    @Inject(UsecasesProxyModule.ADD_USER_TO_ROOM_USECASES_PROXY)
    private readonly addUserToRoomUseCase: UseCaseProxy<AddUserToRoomUseCases>,
    @Inject(UsecasesProxyModule.IS_HOST_USECASES_PROXY)
    private readonly isHostUseCase: UseCaseProxy<IsHostUseCases>,
    @Inject(UsecasesProxyModule.REMOVE_USER_TO_ROOM_USECASES_PROXY)
    private readonly removeUserToRoomUseCase: UseCaseProxy<RemoveUserToRoomUseCases>,
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
      if (await this.gameIsStartedUseCase.getInstance().execute(client.data.code as string)) {
        this.server.to(client.data.user.socketId).emit(WebsocketEvent.GAME_IS_STARTED, true);
        this.server.to(client.data.user.socketId).emit(WebsocketEvent.BOARD, await this.getBoardUseCases.getInstance().execute(client.data.code as string));
        // Si la game est commencé -> renvoyer les cards au user
        // this.server.to(client.data.user.socketId).emit('cards', await this.gameService.getDeck(client.data.code, client.data.user));
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
      await this.removeUserToRoomUseCase.getInstance().execute(client.data.code as string, client.data.user as UserSocket);
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
      await this.removeUserToRoomUseCase.getInstance().execute(client.data.code as string, client.data.user as UserSocket);
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
      const users: UserGame[] = await this.startGameUseCases.getInstance().execute(client.data.code as string, client.data.user as UserSocket);
      for (const user of users) {
        this.server.to(await this.getSocketIdUseCase.getInstance().execute(client.data.code as string, user.userId)).emit(WebsocketEvent.CARDS, user.cards);
      }
      await this.server.to(client.data.code).emit(WebsocketEvent.BOARD, await this.getBoardUseCases.getInstance().execute(client.data.code as string));
      await this.server.to(client.data.code).emit(WebsocketEvent.MEMBERS, await this.getRoomUsersUseCase.getInstance().execute(client.data.code as string));
      await this.server.to(client.data.code).emit(WebsocketEvent.GAME_IS_STARTED, true);
    });
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


// room : 

// host: UserRoom;
// users: UserSocket[];
// code: string;
// started: boolean;
// currentRound: number;

// round : 

// users: UserGame[];
// hasToPlay: UserGame;
// board: object[][]; -> à voir
// deck: Card[];

// UserGamePublic (pour envoyer les members à tout le monde) extends UserSocket

// malus: Malus[];

// UserGame extends UserGamePublic : 

// cards: Card[];
// role: Role; (saboteur ou non)

