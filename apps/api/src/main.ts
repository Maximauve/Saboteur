import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { type MicroserviceOptions, Transport } from "@nestjs/microservices";
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';

import { AppModule } from '@/app.module';
import { LoggingInterceptor } from '@/infrastructure/common/interceptors/logger.interceptor';
import { LoggerService } from '@/infrastructure/logger/logger.service';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // REDIS
  const microserviceOptions: MicroserviceOptions = {
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT ? +process.env.REDIS_PORT : 6379,
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
    },
  };

  app.connectMicroservice(microserviceOptions);

  // SWAGGER
  const config = new DocumentBuilder()
    .setTitle('Saboteur')
    .setDescription('The Saboteur API description')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory);

  // LOGGER
  app.useGlobalInterceptors(new LoggingInterceptor(new LoggerService()));
  app.useGlobalPipes(new ValidationPipe());

  // I18N
  app.useGlobalPipes(new I18nValidationPipe({
    whitelist: true
  }));
  app.useGlobalFilters(
    new I18nValidationExceptionFilter({
      detailedErrors: false,
    }),
  );

  await app.startAllMicroservices();
  await app.listen(process.env.NEST_PORT || 3000);
}
bootstrap();