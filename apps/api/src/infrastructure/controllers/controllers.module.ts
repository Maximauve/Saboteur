import { Module } from '@nestjs/common';

import { UserController } from '@/infrastructure/controllers/user/user.controller';
import { TranslationService } from '@/infrastructure/services/translation/translation.service';
// import { AuthController } from '@/infrastructure/controllers/auth/auth.controller';
// import { TodoController } from '@/infrastructure/controllers/todo/todo.controller';
import { UsecasesProxyModule } from '@/infrastructure/usecases-proxy/usecases-proxy.module';

@Module({
  imports: [UsecasesProxyModule.register()],
  controllers: [UserController],
  providers: [TranslationService]
})
export class ControllersModule {}
