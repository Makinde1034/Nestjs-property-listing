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
import { UserModule } from '../user/user.module';
import { NotificationEventListener } from './events';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), UserModule],
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
