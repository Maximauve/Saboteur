import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthController } from '@/infrastructure/controllers/auth/auth.controller';
import { UserController } from '@/infrastructure/controllers/user/user.controller';
import { AuthService } from '@/infrastructure/services/jwt/jwt.service';
import { TranslationService } from '@/infrastructure/services/translation/translation.service';
import { UsecasesProxyModule } from '@/infrastructure/usecases-proxy/usecases-proxy.module';

@Module({
  imports: [UsecasesProxyModule.register()],
  controllers: [AuthController, UserController],
  providers: [TranslationService, AuthService, JwtService]
})
export class ControllersModule {}
