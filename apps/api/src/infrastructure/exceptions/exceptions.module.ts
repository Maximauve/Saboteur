import { Module } from '@nestjs/common';

import { ExceptionsService } from '@/infrastructure/exceptions/exceptions.service';

@Module({
  providers: [ExceptionsService],
  exports: [ExceptionsService],
})
export class ExceptionsModule {}
