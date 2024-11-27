/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { I18nMiddleware } from 'nestjs-i18n';
import {
  ClassSerializerInterceptor,
  LogLevel,
  ValidationPipe,
} from '@nestjs/common';
import { TrackingMiddleware } from './common/interceptors/user-visit';
import { UserTrackingService } from './modules/user/services/user.tracking.service';
import { TimeoutMiddleware } from './common/interceptors/timeout.middleware';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger:
        process.env.NODE_ENV === 'production'
          ? ['error', 'warn'] // Limit logs in production
          : (['log', 'error', 'warn', 'debug', 'verbose'] as LogLevel[]),
      forceCloseConnections: true,
    });

    const configService = app.get(ConfigService);
    const PORT = configService.get<number>('PORT') || 3000;
    const HOST = configService.get<string>('HOST') || '0.0.0.0';

    // CORS configuration
    app.enableCors({
      origin: configService.get<string>('ALLOWED_ORIGINS') || '*', // Restrict origins in production
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    // Localization middleware
    app.use(I18nMiddleware);

    // Timeout middleware
    app.use(new TimeoutMiddleware().use);

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        enableDebugMessages: process.env.NODE_ENV !== 'production',
        skipMissingProperties: false,
        forbidUnknownValues: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Global serialization interceptor
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );

    // Tracking middleware
    const userTrackingService = app.get(UserTrackingService);
    app.use(new TrackingMiddleware(userTrackingService).use);

    // Enable shutdown hooks
    app.enableShutdownHooks();

    await app.listen(PORT, HOST);
    console.log(`Application is running on: ${await app.getUrl()}`);
  } catch (error) {
    console.error('Error during application bootstrap:', error);
    process.exit(1); // Exit process with failure
  }
}

bootstrap();
