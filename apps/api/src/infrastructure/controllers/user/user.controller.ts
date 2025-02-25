import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Param, Put, UseGuards } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';

import { UserRequest } from '@/infrastructure/common/decorators/user.decorator';
import { JwtAuthGuard } from '@/infrastructure/common/guards/jwtAuth.guard';
import { UpdatedUserDto } from '@/infrastructure/controllers/user/user.dto';
import { UserPresenter } from '@/infrastructure/controllers/user/user.presenter';
import { User } from '@/infrastructure/entities/user.entity';
import { TranslationService } from '@/infrastructure/services/translation/translation.service';
import { UseCaseProxy } from '@/infrastructure/usecases-proxy/usecases-proxy';
import { UsecasesProxyModule } from '@/infrastructure/usecases-proxy/usecases-proxy.module';
import { AddUserUsecaseProxy } from '@/usecases/user/addUser.usecases';
import { DeleteUserByIdUseCases } from '@/usecases/user/deleteUser.usecases';
import { GetUserByEmailUseCases } from '@/usecases/user/getUserByEmail.usecases';
import { GetUserByIdUseCases } from '@/usecases/user/getUserById.usecases';
import { GetUsersUseCases } from '@/usecases/user/getUsers.usecases';
import { UpdateUserUseCases } from '@/usecases/user/updateUser.usecases';

@UseGuards(JwtAuthGuard)
@ApiTags('users')
@ApiUnauthorizedResponse({ description: "User not connected" })
@Controller('users')
export class UserController {

  constructor(
    @Inject(UsecasesProxyModule.GET_USER_BY_ID_USECASES_PROXY)
    private readonly getUserByIdUsecaseProxy: UseCaseProxy<GetUserByIdUseCases>,
    @Inject(UsecasesProxyModule.ADD_USER_USECASES_PROXY)
    private readonly addUserUsecaseProxy: UseCaseProxy<AddUserUsecaseProxy>,
    @Inject(UsecasesProxyModule.GET_USER_BY_EMAIL_USECASES_PROXY)
    private readonly getUserByEmailUsecaseProxy: UseCaseProxy<GetUserByEmailUseCases>,
    @Inject(UsecasesProxyModule.GET_USERS_USESCASES_PROXY)
    private readonly getUsersUsecaseProxy: UseCaseProxy<GetUsersUseCases>,
    @Inject(UsecasesProxyModule.UPDATE_USER_USECASES_PROXY)
    private readonly updateUserUsecaseProxy: UseCaseProxy<UpdateUserUseCases>,
    @Inject(UsecasesProxyModule.DELETE_USER_BY_ID_USECASES_PROXY)
    private readonly deleteUserByIdUsecaseProxy: UseCaseProxy<DeleteUserByIdUseCases>,
    private readonly translationService: TranslationService
  ) { }

  @Get("")
  @ApiOperation({ summary: "Returns all users" })
  @ApiOkResponse({ description: "Users founds successfully", type: User, isArray: true })
  async getAllUsers(): Promise<UserPresenter[]> {
    const users = await this.getUsersUsecaseProxy.getInstance().execute();
    return users.map(user => new UserPresenter(user));
  }

  @Get("/:id")
  @ApiOperation({ summary: 'Returns user' })
  @ApiOkResponse({ description: "User found successfully", type: User })
  async getUserById(@Param('id') id: string): Promise<UserPresenter> {
    const user = await this.getUserByIdUsecaseProxy.getInstance().execute(id);
    if (!user) {
      throw new HttpException(await this.translationService.translate('error.USER_NOT_FOUND'), HttpStatus.NOT_FOUND);
    }
    return new UserPresenter(user);
  }

  @Put("/:id")
  @ApiOperation({ summary: 'Update user' })
  @ApiOkResponse({ description: "User updated" })
  async updateUser(@UserRequest() user: User, @Body() userBody: UpdatedUserDto) {
    await this.updateUserUsecaseProxy.getInstance().execute(user.id, userBody);
  }

  @Delete("/:id")
  @ApiOperation({ summary: "Delete user" })
  @ApiOkResponse({ description: "Delete user successfully" })
  async deleteById(@UserRequest() user: User) {
    await this.deleteUserByIdUsecaseProxy.getInstance().execute(user.id);
  }
}
