import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeOrmConfigModule } from '@/infrastructure/config/typeorm/typeorm.module';
import { Todo } from '@/infrastructure/entities/todo.entity';
import { User } from '@/infrastructure/entities/user.entity';
import { DatabaseTodoRepository } from '@/infrastructure/repositories/todo.repository';
import { DatabaseUserRepository } from '@/infrastructure/repositories/user.repository';

@Module({
  imports: [TypeOrmConfigModule, TypeOrmModule.forFeature([Todo, User])],
  providers: [DatabaseTodoRepository, DatabaseUserRepository],
  exports: [DatabaseTodoRepository, DatabaseUserRepository],
})
export class RepositoriesModule {}
