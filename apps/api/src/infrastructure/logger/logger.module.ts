import { Module } from '@nestjs/common';

import { LoggerService } from '@/infrastructure/logger/logger.service';

@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
