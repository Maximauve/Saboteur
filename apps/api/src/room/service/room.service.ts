import { Injectable } from '@nestjs/common';

import { RedisService } from '@/redis/service/redis.service';
import { RoomModel } from '@/room/room.model';

@Injectable()
export class RoomService {
  constructor(private redisService: RedisService) {}

  async createRoom(): Promise<RoomModel> {
    const room: RoomModel = await {};
    // Make room code
    // check if room code already exists
    // save room in redis
    return room;
  }
}
