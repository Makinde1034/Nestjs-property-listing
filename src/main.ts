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
import * as compression from 'compression';
import { LocationService } from './modules/location/services';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'] as LogLevel[],
    forceCloseConnections: true,
  });
  const configService = app.get(ConfigService);
  const PORT = configService.get('PORT');
  const HOST = configService.get('HOST');
  app.enableCors({ origin: '*' });
  app.use(I18nMiddleware);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      enableDebugMessages: true,
      skipMissingProperties: false,
      forbidUnknownValues: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.use(new TimeoutMiddleware().use);
  const userTrackingService = app.get(UserTrackingService);
  const locationService = app.get(LocationService);
  // Apply the middleware for user tracking
  app.use((req, res, next) => {
    const trackingMiddleware = new TrackingMiddleware(
      userTrackingService,
      locationService,
    );
    trackingMiddleware.use(req, res, next);
  });

  app.use(
    compression({
      level: 6, // Compression level (1-9)
      threshold: 1024, // Minimum response size in bytes
    }),
  );
  app.enableShutdownHooks();
  await app.listen(PORT, HOST);

  const server = app.getHttpServer();
  server.setTimeout(0);

  console.log(process.env.NODE_ENV);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
