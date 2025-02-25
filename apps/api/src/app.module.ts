import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
//* See i18n-nest doc : https://nestjs-i18n.com/guides/type-safety
// eslint-disable-next-line unicorn/import-style

import { ControllersModule } from '@/infrastructure/controllers/controllers.module';
import { LoggerModule } from '@/infrastructure/logger/logger.module';
import { UsecasesProxyModule } from '@/infrastructure/usecases-proxy/usecases-proxy.module';

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
        entities: [],
        autoLoadEntities: true,
        synchronize: true,
        extra: {
          ssl: configService.get('DB_SSL') === 'true',
        },
        subscribers: [],
      }),
      inject: [ConfigService],
    } as TypeOrmModuleAsyncOptions),
    // I18nModule.forRoot({
    //   fallbackLanguage: 'fr',
    //   fallbacks: {
    //     'fr-*': 'fr'
    //   },
    //   loaderOptions: {
    //     path: path.join(__dirname, '/i18n/'),
    //     watch: true,
    //   },
    //   typesOutputPath: path.join(__dirname, '../src/generated/i18n.generated.ts'),
    //   resolvers: [
    //     { use: QueryResolver, options: ['lang', 'locale'] },
    //     AcceptLanguageResolver,
    //   ],
    // }),
    PassportModule,
    ControllersModule,
    LoggerModule,
    UsecasesProxyModule.register(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
