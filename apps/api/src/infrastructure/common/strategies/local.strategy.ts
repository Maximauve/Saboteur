import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { ExceptionsService } from '@/infrastructure/exceptions/exceptions.service';
import { LoggerService } from '@/infrastructure/logger/logger.service';
import { UseCaseProxy } from '@/infrastructure/usecases-proxy/usecases-proxy';
import { UsecasesProxyModule } from '@/infrastructure/usecases-proxy/usecases-proxy.module';
import { LoginUseCases } from '@/usecases/auth/login.usecases';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(UsecasesProxyModule.LOGIN_USECASES_PROXY)
    private readonly loginUsecaseProxy: UseCaseProxy<LoginUseCases>,
    private readonly logger: LoggerService,
    private readonly exceptionService: ExceptionsService,
  ) {
    super();
  }

  async validate(username: string, password: string) {
    if (!username || !password) {
      this.logger.warn('LocalStrategy', `Username or password is missing, BadRequestException`);
      this.exceptionService.UnauthorizedException();
    }
    const user = await this.loginUsecaseProxy.getInstance().validateUserForLocalStragtegy(username, password);
    if (!user) {
      this.logger.warn('LocalStrategy', `Invalid username or password`);
      this.exceptionService.UnauthorizedException({ message: 'Invalid username or password.' });
    }
    return user;
  }
}
