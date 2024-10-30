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

import { AdminNotificationPreferenceRepository } from './repositories/admin.repository';
@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  providers: [
    NotificationResolver,
    NotificationService,
    PushNotificationService,
    NotificationRepository,
    NotificationEventListener,
    AdminNotificationPreferenceRepository,
  ],
  exports: [
    PushNotificationService,
    NotificationRepository,
    AdminNotificationPreferenceRepository,
  ],
})
export class NotificationModule {}
