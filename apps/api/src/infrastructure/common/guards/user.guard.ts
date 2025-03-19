import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { RequestWithParamUser } from "@/domain/request/RequestWithParamUser";
import { User } from "@/infrastructure/entities/user.entity";
import { TranslationService } from "@/infrastructure/services/translation/translation.service";
import { uuidRegex } from "@/infrastructure/utils/regex.variable";

@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly translationsService: TranslationService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithParamUser>();
    const userId = request.params.userId;

    if (!uuidRegex.test(userId)) {
      throw new HttpException(await this.translationsService.translate("error.ID_INVALID"), HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new HttpException(await this.translationsService.translate("error.USER_NOT_NOUD"), HttpStatus.NOT_FOUND);
    }

    request.user = user;
    return true;
  }
}
