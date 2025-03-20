import { Body, Controller, HttpException, HttpStatus, Inject, Post, Res } from '@nestjs/common';
import { ApiConflictResponse, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';

import { LoginResponse } from '@/domain/adapters/loginResponse';
import { LoginDto, RegisterDto } from '@/infrastructure/controllers/auth/auth-dto';
import { AuthService } from '@/infrastructure/services/jwt/jwt.service';
import { TranslationService } from '@/infrastructure/services/translation/translation.service';
import { UseCaseProxy } from '@/infrastructure/usecases-proxy/usecases-proxy';
import { UsecasesProxyModule } from '@/infrastructure/usecases-proxy/usecases-proxy.module';
import { AddUserUseCases } from '@/usecases/user/addUser.usecases';
import { CheckUnknownUserUseCases } from '@/usecases/user/checkUnknownUser.usecases';
import { GetUserByEmailUseCases } from '@/usecases/user/getUserByEmail.usecases';

const expirationTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(UsecasesProxyModule.GET_USER_BY_EMAIL_USECASES_PROXY)
    private readonly getUserByEmailUsecaseProxy: UseCaseProxy<GetUserByEmailUseCases>,
    @Inject(UsecasesProxyModule.CHECK_UNKNOWN_USER_USESCASES_PROXY)
    private readonly checkUnknownUserUsecaseProxy: UseCaseProxy<CheckUnknownUserUseCases>,
    @Inject(UsecasesProxyModule.ADD_USER_USECASES_PROXY)
    private readonly addUserUsecasesProxy: UseCaseProxy<AddUserUseCases>,
    private readonly translationService: TranslationService,
    private readonly authService: AuthService
  ) {}
    
  @Post('/login')
  @ApiOperation({ summary: 'Login user' })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiOkResponse({ type: LoginResponse })
  async login(@Body() body: LoginDto, @Res() response: Response): Promise<Response<LoginResponse>> {
    const user = await this.getUserByEmailUsecaseProxy.getInstance().execute(body.email);
    if (!user) {
      throw new HttpException(await this.translationService.translate('error.INVALID_CREDENTIALS'), HttpStatus.BAD_REQUEST);
    }
    if (await comparePassword(body.password, user.password)) {
      throw new HttpException(await this.translationService.translate('error.INVALID_CREDENTIALS'), HttpStatus.BAD_REQUEST); // user does not know if email or password is not valid
    }
    const { accessToken } = this.authService.login(user);
    response.cookie('access_token', accessToken, {
      expires: expirationTime,
      httpOnly: true
    });
    return response.send({ accessToken });
  }

  @Post('/register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiInternalServerErrorResponse({ description: "An unexpected error occurred while creating the user" })
  @ApiConflictResponse({ description: "A user with the given email or username already exists" })
  @ApiCreatedResponse({ 
    description: "The user was successfully registered and an access token has been returned", 
    type: LoginResponse 
  })
  async register(@Body() body: RegisterDto, @Res() response: Response): Promise<Response<LoginResponse>> {
    if (await this.checkUnknownUserUsecaseProxy.getInstance().execute(body)) {
      throw new HttpException(await this.translationService.translate('error.USER_EXIST'), HttpStatus.CONFLICT);
    }
    body.password = await hashPassword(body.password);
    const user = await this.addUserUsecasesProxy.getInstance().execute(body);
    if (!user) {
      throw new HttpException(await this.translationService.translate('error.USER_CANT_CREATE'), HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const { accessToken } = this.authService.login(user);
    response.cookie('access_token', accessToken, {
      expires: expirationTime,
      httpOnly: true
    });
    return response.send({ accessToken });
  }

  @Post('/logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiOkResponse({ type: LoginResponse })
  logout(@Res() response: Response): void {
    response.clearCookie('access_token');
    response.send();
  }
}

async function hashPassword(plaintextPassword: string) {
  return bcrypt.hash(plaintextPassword, 10);
}

async function comparePassword(plaintextPassword: string, hash: string) {
  return bcrypt.compare(plaintextPassword, hash);
}
