/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { forwardRef, Global, Module } from '@nestjs/common';
import { NotificationResolver } from './notification.resolver';
import { NotificationService, PushNotificationService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification, UserNotificationPreference } from 'src/entities';
import { NotificationEventListener } from './events';
import { NotificationRepository } from './repositories';

import { AdminNotificationPreferenceRepository } from './repositories/admin.repository';
import { NotificationTokenRepository } from './repositories/notification-token.repository';
import { NotificationMessagesRepository } from './repositories/notification-message.repository';
import { UserNotificationRepository } from '../user/repositories';
import { NotificationController } from './controller/notification.controller';
// import { InAppService } from '../../in-app-services/in-app.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, UserNotificationPreference]),
  ],

  controllers: [NotificationController],
  providers: [
    // InAppService,
    NotificationResolver,
    NotificationService,
    PushNotificationService,
    NotificationRepository,
    NotificationEventListener,
    AdminNotificationPreferenceRepository,
    NotificationTokenRepository,
    NotificationMessagesRepository,
    NotificationTokenRepository,
    UserNotificationRepository,
  ],
  exports: [
    NotificationService,
    PushNotificationService,
    NotificationRepository,
    AdminNotificationPreferenceRepository,
    NotificationTokenRepository,
    NotificationMessagesRepository,
    UserNotificationRepository,
  ],
})
export class NotificationModule {}
