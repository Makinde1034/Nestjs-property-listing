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
import configuration from './database/seeders/config/configuration';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MailModule } from './modules/mail/mail.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { FilehandlerModule } from './modules/file-handler/file-handler.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ListingModule } from './modules/listing/listing.module';
import {
  GoogleRecaptchaModule,
  GoogleRecaptchaModuleOptions,
} from '@nestlab/google-recaptcha';
import { IssueModule } from './modules/issue/issue.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { ReviewModule } from './modules/review/review.module';

import { LocationModule } from './modules/location/location.module';
import { AdPackageModule } from './modules/ad-package/ad-package.module';

import { PaymentModule } from './modules/payment/payment.module';
import { ScheduleModule } from '@nestjs/schedule';
import { WebHookModule } from './modules/webhook/web-hook.module';

import { AdminModule } from './modules/admin/admin.module';
import { ChatModule } from './modules/chat/chat.module';
import { SplashScreenResolver } from './modules/admin/resolver/splash-screen.resolver';
import { KnowledgeBaseAndHelpModule } from './modules/knowledge-base-and-help/knowledge-base-and-help.module';
import { InAppModule } from './modules/in-app-services/in-app.module';
import { GlobalPermissionsGuard } from './modules/auth/guards/global-permission-guard';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { AppResolver } from './modules/app/app.resolver';
import { AppController } from './modules/app/app.controller';
import { SseService } from './modules/app/client.service';
import { SseModule } from './modules/app/event.module';

@Module({
  imports: [
    SseModule,
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'development'
          ? '.env.development.local'
          : '.env',
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
    CacheModule.register({
      isGlobal: true, // Make it globally available
      store: 'redis', // Use Redis as the cache store
      host: 'localhost',
      port: 6379,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'src/schema.gql',

      formatError: (err) => formatError(err),
      fieldResolverEnhancers: ['interceptors'],
      context: ({ req, res }) => ({ req, res }),
      playground: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) =>
        configService.get<TypeOrmModuleOptions>('db.postgres', {
          type: 'postgres',
        }),
      inject: [ConfigService],
    }),
    GoogleRecaptchaModule.forRootAsync({
      useFactory: (config: ConfigService) =>
        config.get<GoogleRecaptchaModuleOptions>('recaptcha'),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    EventEmitterModule.forRoot(),
    MailModule,
    ThrottlerModule.forRoot(),
    FilehandlerModule,
    NotificationModule,
    ListingModule,
    IssueModule,
    TicketsModule,
    ReviewModule,
    LocationModule,
    AdPackageModule,
    AdminModule,
    PaymentModule,
    WebHookModule,
    ChatModule,
    KnowledgeBaseAndHelpModule,
    InAppModule,
  ],
  controllers: [AppController],
  providers: [
    AppResolver,
    SseService,
    SplashScreenResolver,
    {
      provide: APP_GUARD,
      useClass: GlobalPermissionsGuard,
    },
  ],
  exports: [],
})
export class AppModule {}
