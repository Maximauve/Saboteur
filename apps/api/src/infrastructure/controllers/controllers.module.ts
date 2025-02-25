import { Module } from '@nestjs/common';

import { AuthController } from '@/infrastructure/controllers/auth/auth.controller';
import { TodoController } from '@/infrastructure/controllers/todo/todo.controller';
import { UsecasesProxyModule } from '@/infrastructure/usecases-proxy/usecases-proxy.module';

@Module({
  imports: [UsecasesProxyModule.register()],
  controllers: [TodoController, AuthController],
})
export class ControllersModule {}
