import { Injectable } from "@nestjs/common";

import { Board } from "@/domain/model/board";
import { Room } from "@/domain/model/room";
import { Round } from "@/domain/model/round";
import { UserGame, UserGamePublic, UserSocket } from "@/domain/model/user";
import { RoomRepository } from "@/domain/repositories/roomRepository.interface";
import { RedisService } from "@/infrastructure/services/redis/service/redis.service";
import { TranslationService } from "@/infrastructure/services/translation/translation.service";

@Injectable()
export class DatabaseRoomRepository implements RoomRepository {
  constructor(
    private readonly redisService: RedisService,
    private readonly translationService: TranslationService
  ) {}

  async setRoom(code: string, values: string[]): Promise<void> {
    await this.redisService.hset(`room:${code}`, values);
  }

  async setRound(code: string, nbRound: number, values: string[]): Promise<void> {
    await this.redisService.hset(`room:${code}:${nbRound}`, values);
  }

  async gameIsStarted(code: string) {
    const room = await this.getRoom(code);
    return room.started;
  }

  async getRound(code: string, roundNumber?: number): Promise<Round> {
    if (!roundNumber) {
      const room = await this.getRoom(code);
      roundNumber = room.currentRound;
    }
    if ((await this.redisService.exists(`room:${code}:${roundNumber}`)) === 0) {
      throw new Error(`La room ${code} n'existe pas`);
    }
    const roundData = await this.redisService.hgetall(`room:${code}:${roundNumber}`);
    return {
      users: JSON.parse(roundData.users || '[]'),
      objectiveCards: JSON.parse(roundData.objectiveCards || '[]'),
      treasurePosition: Number.parseInt(roundData.treasurePosition),
      deck: JSON.parse(roundData.deck || '[]'),
      board: JSON.parse(roundData.board || '[]'),
      currentTurn: Number.parseInt(roundData.currentTurn),
    } as Round;
  }

  async getRoomUsers(code: string) {
    const room = await this.getRoom(code);
    const round = await this.getRound(code);
    if (!round) {
      return room.users.map(user => ({
        ...user,
        malus: [],
        hasToPlay: false
      }));
    }
    return room.users.map(roomUser => {
      const roundUser = round.users.find(u => u.userId === roomUser.userId);
      
      if (roundUser) {
        return {
          username: roomUser.username,
          userId: roomUser.userId,
          isHost: roomUser.isHost,
          socketId: roomUser.socketId,
          ready: roomUser.ready,
          gold: roomUser.gold,
          malus: roundUser.malus || [],
          hasToPlay: roundUser.hasToPlay || false
        } as UserGamePublic;
      }
      
      return {
        ...roomUser,
        malus: [],
        hasToPlay: false
      } as UserGamePublic;
    });
  }

  async getCurrentRoundUser(code: string, userId: string): Promise<UserGame|null> {
    let round: Round;
    try {
      round = await this.getRound(code);
    } catch {
      return null;
    }
    const user = round.users.find(u => u.userId === userId);
    if (user === undefined) {
      return null;
    }
    return user; 
  }

  async getBoard(code: string): Promise<Board> {
    const round = await this.getRound(code);
    return round.board;
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
    if ((!this.doesRoomExists(code))) {
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

  async getUserGame(code: string, userId: string): Promise<UserGame> {
    const round = await this.getRound(code);
    const user = round.users.find(userGame => userGame.userId === userId);
    if (!user) {
      throw new Error(await this.translationService.translate('USER_NOT_FOUND'));
    }
    return user;
  }

  async doesRoomExists(code: string): Promise<boolean> {
    const exists = await this.redisService.exists(`room:${code}`);
    return exists === 1; 
  }
}
