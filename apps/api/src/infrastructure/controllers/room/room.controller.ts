import { Controller, Inject, Post, UseGuards } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';

import { UserFromRequest } from '@/domain/model/user';
import { CurrentUser } from '@/infrastructure/common/decorators/currentUser.decorator';
import { JwtAuthGuard } from '@/infrastructure/common/guards/jwtAuth.guard';
import { User } from '@/infrastructure/entities/user.entity';
import { TranslationService } from '@/infrastructure/services/translation/translation.service';
import { UseCaseProxy } from '@/infrastructure/usecases-proxy/usecases-proxy';
import { UsecasesProxyModule } from '@/infrastructure/usecases-proxy/usecases-proxy.module';
import { CreateRoomUseCases } from '@/usecases/room/createRoom.usecases';

@UseGuards(JwtAuthGuard)
@ApiTags('room')
@ApiUnauthorizedResponse({ description: "User not connected" })
@Controller('room')
export class RoomController {

  constructor(
    @Inject(UsecasesProxyModule.CREATE_ROOM_USECASES_PROXY)
    private readonly createRoomUseCaseProxy: UseCaseProxy<CreateRoomUseCases>,
    private readonly translationService: TranslationService
  ) {}

  @Post("")
  @ApiOperation({ summary: "Create a room" })
  @ApiOkResponse({ description: "Room created successfully", type: User, isArray: true })
  async createRoom(@CurrentUser() user: UserFromRequest) {
    await this.createRoomUseCaseProxy.getInstance().execute(user);
  }
}
