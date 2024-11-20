import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from "socket.io";

import { RedisService } from '@/redis/service/redis.service';
import { RoomService } from '@/room/service/room.service';

@WebSocketGateway({ cors: '*', namespace: 'room' })
export class RoomWebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {

  constructor(
    private readonly redisService: RedisService,
    private readonly roomService: RoomService,
  ) {}

  @WebSocketServer() server: Server;

  handleConnection(socket: Socket): void {
    const socketId = socket.id;
    socket.data.user = { /* todo */};
    socket.data.code = socket.handshake.query.code as string;
    console.log(`New connecting... socket id:`, socketId);
  }

  handleDisconnect(socket: Socket): void {
    // gerer le cas si disconnect pendant une partie
    console.log(`Disconnecting... socket id:`, socket.id);
  }
}
