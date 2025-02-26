import { Injectable } from "@nestjs/common";

import { GameRepository } from "@/domain/repositories/gameRepositories";
import { RedisService } from "@/infrastructure/services/redis/service/redis.service";
import { TranslationService } from "@/infrastructure/services/translation/translation.service";

@Injectable()
export class DatabaseGameRepository implements GameRepository {
  constructor(
    private readonly redisService: RedisService,
    private readonly translationService: TranslationService
  ) {}
}

