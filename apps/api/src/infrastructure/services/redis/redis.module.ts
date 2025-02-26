import { Module } from '@nestjs/common';

import { RedisService } from '@/infrastructure/services/redis/service/redis.service';

@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}