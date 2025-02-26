import { Module } from '@nestjs/common';

import { RedisService } from '@/infrastructure/services/redis/service/redis.service';
import { TranslationService } from '@/infrastructure/services/translation/translation.service';
import { UsecasesProxyModule } from '@/infrastructure/usecases-proxy/usecases-proxy.module';
import { RoomWebsocketGateway } from '@/infrastructure/websockets/room.websocket';

@Module({
  imports: [UsecasesProxyModule.register()],
  providers: [RedisService, TranslationService, RoomWebsocketGateway],
})
export class WebSocketModule {}