import { Injectable } from "@nestjs/common";

import { Room } from "@/domain/model/room";
import { UserFromRequest, UserRoom, UserSocket } from "@/domain/model/user";
import { RoomRepository } from "@/domain/repositories/roomRepository.interface";
import { RedisService } from "@/infrastructure/services/redis/service/redis.service";
import { TranslationService } from "@/infrastructure/services/translation/translation.service";

@Injectable()
export class DatabaseRoomRepository implements RoomRepository {
  constructor(
    private readonly redisService: RedisService,
    private readonly translationService: TranslationService
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
      users: [],
      started: false,
      currentRound: 0,
    };

    room.code = await this.generateUniqueRoomCode();
    const roomKey = `room:${room.code}`;
    await this.redisService.hset(roomKey, [
      'code',
      room.code.toString(),
      'host',
      JSON.stringify(host),
      'users',
      JSON.stringify(room.users),
      'started',
      room.started.toString(),
      'currentRound',
      room.currentRound.toString(),
    ]);
    await this.redisService.hset(`${roomKey}:0`, [
      'users',
      JSON.stringify([host]),
    ]);
    return room;
  }

  async addUserToRoom(code: string, user: UserSocket) {
    const room = await this.getRoom(code);
    if (
      room.started === true &&
      !room.users.some((element: UserSocket) => user.userId === element.userId)
    ) {
      throw new Error(await this.translationService.translate("error.ROOM_ALREADY_STARTED"));
    }
    if (
      room.users.length >= 10 &&
      !room.users.some((element: UserSocket) => user.userId === element.userId)
    ) {
      throw new Error(await this.translationService.translate("error.ROOM_MAX"));
    }
    if (room.host.userId === user.userId) {
      const host = room.users.find((element: UserSocket) => element.userId === user.userId);
      if (host) {
        host.socketId = user.socketId;
      } else {
        room.users.push(user);
      }
      await this.redisService.hset(`room:${code}`, [
        'host', JSON.stringify(user),
        'users', JSON.stringify(room.users)
      ]);
    } else if (
      room.users.some((element: UserSocket) => element.userId === user.userId)
    ) {
      const existingUser = room.users.find((element: UserSocket) => element.userId === user.userId);
      if (existingUser) {
        existingUser.socketId = user.socketId;
      }
      await this.redisService.hset(`room:${code}`, [
        'users', JSON.stringify(room.users)
      ]);
    } else {
      await this.redisService.hset(`room:${code}`, [
        'users', JSON.stringify([...room.users, user]),
      ]);
    }
    return;
  }

  async removeUserToRoom(code: string, user: UserSocket): Promise<void> {
    const room = await this.getRoom(code);
    if (room.started) {
      return;
    }
    const users = room.users.filter(
      (element: UserSocket) => element.userId !== user.userId,
    );
    await this.redisService.hset(`room:${code}`, [
      'users',
      JSON.stringify(users),
    ]);
    return;
  }

  async gameIsStarted(code: string) {
    const room = await this.getRoom(code);
    return room.started;
  }

  async getRoomUsers(code: string) {
    const room = await this.getRoom(code);
    // Si on met en place le round => il faut merger les deux
    console.log("getRoomUsers", room);
    return room.users;
  }

  async isHost(code: string, user: UserSocket) {
    const room = await this.getRoom(code);
    return room.host.userId === user.userId;
  }

  async getSocketId(code: string, userId: string) {
    const room = await this.getRoom(code);
    return room.users.find((user: UserSocket) => user.userId === userId)?.socketId;
  }

  async getRoom(code: string) {
    const roomKey = `room:${code}`;
    if ((await this.redisService.exists(roomKey)) === 0) {
      throw new Error(`La room ${code} n'existe pas`);
    }
    const roomData = await this.redisService.hgetall(roomKey);
    return {
      code: roomData.code,
      users: JSON.parse(roomData.users || '[]'),
      host: JSON.parse(roomData.host),
      started: roomData.started === 'true',
      currentRound: Number.parseInt(roomData.currentRound),
    } as Room;
  }

  private generateUniqueRoomCode = async (): Promise<string> => {
    const code = Math.floor(100_000 + Math.random() * 900_000).toString();
    const roomKey = `room:${code}`;
    if (await this.redisService.exists(roomKey) === 1) {
      return this.generateUniqueRoomCode();
    }
    return code;
  };
}