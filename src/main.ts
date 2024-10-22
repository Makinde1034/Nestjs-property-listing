/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { I18nMiddleware } from 'nestjs-i18n';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { TrackingMiddleware } from './common/interceptors/user-visit';
import { UserTrackingService } from './modules/user/services/user.tracking.service';
import { TimeoutMiddleware } from './common/interceptors/timeout.middleware';
new Logger();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const PORT = configService.get('PORT');
  const HOST = configService.get('HOST');

  app.enableCors();
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

  const UsertrackingService = app.get(UserTrackingService);

  // Apply the middleware
  app.use((req, res, next) => {
    const trackingMiddleware = new TrackingMiddleware(UsertrackingService);
    trackingMiddleware.use(req, res, next);
  });

  await app.listen(PORT, HOST);
}
bootstrap();
