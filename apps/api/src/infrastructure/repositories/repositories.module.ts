import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@/infrastructure/entities/user.entity';
import { DatabaseRoomRepository } from '@/infrastructure/repositories/room.repositories';
import { DatabaseUserRepository } from '@/infrastructure/repositories/user.repository';
import { RedisService } from '@/infrastructure/services/redis/service/redis.service';
import { TranslationService } from '@/infrastructure/services/translation/translation.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [DatabaseUserRepository, DatabaseRoomRepository, TranslationService, RedisService],
  exports: [DatabaseUserRepository, DatabaseRoomRepository],
})
export class RepositoriesModule {}
