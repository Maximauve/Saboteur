import { Module } from '@nestjs/common';
import { forwardRef } from "@nestjs/common/utils";

import { RedisModule } from "@/redis/redis.module";
import { RoomController } from '@/room/controller/room.controller';
import { RoomService } from '@/room/service/room.service';

@Module({
  imports: [forwardRef(() => RedisModule)],
  controllers: [RoomController],
  providers: [RoomService],
  exports: [RoomService]
})
export class RoomModule { }
