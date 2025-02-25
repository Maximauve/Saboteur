import { Body, Controller, Get, Inject, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiExtraModels, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { JwtAuthGuard } from '@/infrastructure/common/guards/jwtAuth.guard';
import JwtRefreshGuard from '@/infrastructure/common/guards/jwtRefresh.guard';
import { LoginGuard } from '@/infrastructure/common/guards/login.guard';
import { ApiResponseType } from '@/infrastructure/common/swagger/response.decorator';
import { IsAuthPresenter } from '@/infrastructure/controllers/auth/auth.presenter';
import { AuthLoginDto } from '@/infrastructure/controllers/auth/auth-dto.class';
import { UseCaseProxy } from '@/infrastructure/usecases-proxy/usecases-proxy';
import { UsecasesProxyModule } from '@/infrastructure/usecases-proxy/usecases-proxy.module';
import { IsAuthenticatedUseCases } from '@/usecases/auth/isAuthenticated.usecases';
import { LoginUseCases } from '@/usecases/auth/login.usecases';
import { LogoutUseCases } from '@/usecases/auth/logout.usecases';

@Controller('auth')
@ApiTags('auth')
@ApiResponse({
  status: 401,
  description: 'No authorization token was found',
})
@ApiResponse({ status: 500, description: 'Internal error' })
@ApiExtraModels(IsAuthPresenter)
export class AuthController {
  constructor(
    @Inject(UsecasesProxyModule.LOGIN_USECASES_PROXY)
    private readonly loginUsecaseProxy: UseCaseProxy<LoginUseCases>,
    @Inject(UsecasesProxyModule.LOGOUT_USECASES_PROXY)
    private readonly logoutUsecaseProxy: UseCaseProxy<LogoutUseCases>,
    @Inject(UsecasesProxyModule.IS_AUTHENTICATED_USECASES_PROXY)
    private readonly isAuthUsecaseProxy: UseCaseProxy<IsAuthenticatedUseCases>,
  ) {}

  @Post('login')
  @UseGuards(LoginGuard)
  @ApiBearerAuth()
  @ApiBody({ type: AuthLoginDto })
  @ApiOperation({ description: 'login' })
  async login(@Body() auth: AuthLoginDto, @Res({ passthrough: true }) response: FastifyReply) {
    const accessTokenInfo = await this.loginUsecaseProxy.getInstance().getCookieWithJwtToken(auth.username);
    const refreshTokenInfo = await this.loginUsecaseProxy.getInstance().getCookieWithJwtRefreshToken(auth.username);

    response.setCookie('accessToken', accessTokenInfo.token, {
      path: '/',
      httpOnly: true,
      secure: true,
      maxAge: Number(accessTokenInfo.maxAge),
    });
    response.setCookie('refreshToken', refreshTokenInfo.token, {
      path: '/',
      httpOnly: true,
      secure: true,
      maxAge: Number(refreshTokenInfo.maxAge),
    });
    return 'Login successful';
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: 'logout' })
  logout(@Res({ passthrough: true }) response: FastifyReply) {
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
    return 'Logout successful';
  }

  @Get('is_authenticated')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: 'is_authenticated' })
  @ApiResponseType(IsAuthPresenter, false)
  async isAuthenticated(@Req() request: any) { // todo : fix request
    const user = await this.isAuthUsecaseProxy.getInstance().execute(request.user.username);
    const response = new IsAuthPresenter();
    response.username = user.username;
    return response;
  }

  @Get('refresh')
  @UseGuards(JwtRefreshGuard)
  @ApiBearerAuth()
  async refresh(@Req() request: any, @Res({ passthrough: true }) response: FastifyReply) { // todo : fix request
    const accessTokenInfo = await this.loginUsecaseProxy.getInstance().getCookieWithJwtToken(request.user.username);
    response.setCookie('accessToken', accessTokenInfo.token, {
      path: '/',
      httpOnly: true,
      secure: true,
      maxAge: Number(accessTokenInfo.maxAge),
    });
    return 'Refresh successful';
  }
}
