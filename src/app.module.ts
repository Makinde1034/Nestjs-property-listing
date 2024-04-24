/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { formatError } from './common/utils/format-error';
import { AppResolver } from './modules/app/app.resolver';
import configuration from './config/configuration';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MailModule } from './modules/mail/mail.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      load: configuration,
      isGlobal: true,
    }),

    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'src/schema.gql',
      formatError: (err) => formatError(err),
      fieldResolverEnhancers: ['interceptors'],
      context: ({ req, res }) => ({ req, res }),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) =>
        configService.get<TypeOrmModuleOptions>('db.postgres', {
          type: 'postgres',
        }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    EventEmitterModule.forRoot(),
    MailModule,
    ThrottlerModule.forRoot(),
  ],
  controllers: [],
  providers: [AppResolver],
})
export class AppModule {}
