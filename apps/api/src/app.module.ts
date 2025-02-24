import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
//* See i18n-nest doc : https://nestjs-i18n.com/guides/type-safety
// eslint-disable-next-line unicorn/import-style
import * as path from 'node:path';

import { AuthModule } from '@/auth/auth.module';
import { AuthExceptionFilter } from '@/auth/exception-filter/exception-filter'; 
import { FileUploadModule } from '@/files/files.module';
import { RedisModule } from '@/redis/redis.module';
import { RoomModule } from '@/room/room.module';
import { RoomWebsocketGateway } from '@/room/room.websocket.gateway';
import { TranslationService } from '@/translation/translation.service';
import { UsersModule } from '@/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env']
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: true,
        extra: {
          ssl: configService.get('DB_SSL') === 'true',
        }
      }),
      inject: [ConfigService],
    } as TypeOrmModuleAsyncOptions),
    I18nModule.forRoot({
      fallbackLanguage: 'fr',
      fallbacks: {
        'fr-*': 'fr'
      },
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      typesOutputPath: path.join(__dirname, '../src/generated/i18n.generated.ts'),
      resolvers: [
        { use: QueryResolver, options: ['lang', 'locale'] },
        AcceptLanguageResolver,
      ],
    }),
    RedisModule,
    UsersModule,
    AuthModule,
    FileUploadModule,
    RoomModule
  ],
  controllers: [],
  providers: [
    TranslationService,
    {
      provide: APP_FILTER,
      useClass: AuthExceptionFilter,
    },
    RoomWebsocketGateway
  ],
})
export class AppModule { }
