/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Module } from '@nestjs/common';
import { NotificationResolver } from './notification.resolver';
import { NotificationService, PushNotificationService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from 'src/entities';
import { NotificationRepository } from './repositories';
import { NotificationEventListener } from './events';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  providers: [
    NotificationResolver,
    NotificationService,
    PushNotificationService,
    NotificationRepository,
    NotificationEventListener,
  ],
  exports: [PushNotificationService],
})
export class NotificationModule {}
