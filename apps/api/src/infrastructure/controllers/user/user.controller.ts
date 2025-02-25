import { Body, Controller, Get, HttpException, HttpStatus, Inject, Param, Post } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';

import { CreateUserDto } from '@/infrastructure/controllers/user/user.dto';
import { UserPresenter } from '@/infrastructure/controllers/user/user.presenter';
import { User } from '@/infrastructure/entities/user.entity';
import { UseCaseProxy } from '@/infrastructure/usecases-proxy/usecases-proxy';
import { UsecasesProxyModule } from '@/infrastructure/usecases-proxy/usecases-proxy.module';
import { AddUserUsecaseProxy } from '@/usecases/user/addUser.usecases';
import { GetUserByIdUseCases } from '@/usecases/user/getUser.usecases';

// @UseGuards(JwtAuthGuard)
@ApiTags('users')
@ApiUnauthorizedResponse({ description: "User not connected" })
@Controller('users')
export class UserController {

  constructor(@Inject(UsecasesProxyModule.GET_USER_BY_ID_USECASES_PROXY)
  private readonly getUserbyIdUsecaseProxy: UseCaseProxy<GetUserByIdUseCases>,
  @Inject(UsecasesProxyModule.ADD_USER_USECASES_PROXY)
  private readonly addUserUsecaseProxy: UseCaseProxy<AddUserUsecaseProxy>) { }

  @Get("/:id")
  @ApiOperation({ summary: 'Returns user' })
  @ApiOkResponse({ description: "User found successfully", type: User })
  async getUserById(@Param('id') id: string): Promise<UserPresenter> {
    const user = await this.getUserbyIdUsecaseProxy.getInstance().execute(id);
    if (!user) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }
    return new UserPresenter(user);
  }

  @Post("")
  @ApiOperation({ summary: 'Create user' })
  @ApiOkResponse({ description: "User created" })
  async createUser(@Body() userBody: CreateUserDto) {
    const userCreated = await this.addUserUsecaseProxy.getInstance().execute(userBody);
    console.log(userCreated)
    console.log(new UserPresenter(userCreated));
    return new UserPresenter(userCreated);
  }
}
