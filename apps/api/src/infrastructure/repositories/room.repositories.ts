import { Injectable } from "@nestjs/common";

import { Room } from "@/domain/model/room";
import { UserFromRequest, UserRoom } from "@/domain/model/user";
import { RoomRepository } from "@/domain/repositories/roomRepository.interface";
import { RedisService } from "@/infrastructure/services/redis/service/redis.service";

@Injectable()
export class DatabaseRoomRepository implements RoomRepository {
  constructor(
    private readonly redisService: RedisService,
  ) {}

  async createRoom(user: UserFromRequest) {
    const host: UserRoom = {
      username: user.username,
      userId: user.id,
      isHost: true
    };
    const room: Room = {
      code: Math.floor(100_000 + Math.random() * 900_000).toString(),
      host: host,
      users: [host],
      started: false,
    };
    let roomKey = `room:${room.code}`;
    while ((await this.redisService.exists(roomKey)) === 1) {
      room.code = Math.floor(100_000 + Math.random() * 900_000).toString();
      roomKey = `room:${room.code}`;
    }
    await this.redisService.hset(roomKey, [
      'code',
      room.code.toString(),
      'host',
      JSON.stringify(host),
      'users',
      JSON.stringify(room.users),
      'started',
      room.started.toString(),
    ]);
    await this.redisService.hset(`${roomKey}:0`, [
      'users',
      JSON.stringify([host]),
    ]);
    return room;
  }
}