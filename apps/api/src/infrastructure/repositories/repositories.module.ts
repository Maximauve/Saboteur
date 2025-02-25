import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@/infrastructure/entities/user.entity';
import { DatabaseUserRepository } from '@/infrastructure/repositories/user.repository';
import { TranslationService } from '@/infrastructure/services/translation/translation.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [DatabaseUserRepository, TranslationService],
  exports: [DatabaseUserRepository],
})
export class RepositoriesModule {}
