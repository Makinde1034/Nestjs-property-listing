/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Module } from '@nestjs/common';
import { NotificationResolver } from './notification.resolver';
import { NotificationService, PushNotificationService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from 'src/entities';
import { NotificationEventListener } from './events';
import { NotificationRepository } from './repositories';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  providers: [
    NotificationResolver,
    NotificationService,
    PushNotificationService,
    NotificationRepository,
    NotificationEventListener,
  ],
  exports: [PushNotificationService, NotificationRepository],
})
export class NotificationModule {}
