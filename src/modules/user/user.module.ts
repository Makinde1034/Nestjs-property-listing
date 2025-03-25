/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Global, Module } from '@nestjs/common';
import { UserService, RoleService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  NationalIdentity,
  Permission,
  Role,
  TokenConfirmation,
  User,
  NotificationScope,
  UserNotificationPreference,
  RolePermissions,
} from '../../entities';
import {
  UserConfirmationRepository,
  UserRepository,
  RoleRepository,
  PermissionRepository,
  NationalIdentityRepository,
  NotificationScopeRepository,
  UserNotificationRepository,
  RolePermissionRepository,
} from './repositories';
import { UserResolver, RoleResolver } from './resolvers';
import { UserController } from './controllers';
import { UserEventHandler } from './events';
import { UserTrackingService } from './services/user.tracking.service';
import { UserTrackingRepository } from './repositories/user-tracking-repository';
import { NafathService } from './service-providers/nafath.service';
import { NafathLogsRepository } from './repositories/nafath-log.repository';
import { HttpModule } from '@nestjs/axios';
import { ActivityLogRepository } from '../activity-log/repositories/activity-log.repository';
import { ActivityLogService } from '../activity-log/services/activity-log.service';
import { NotificationModule } from '../notification/notification.module';
import { PushNotificationService } from '../notification/services';

@Global()
@Module({
  imports: [
    NotificationModule,

    HttpModule,
    TypeOrmModule.forFeature([
      User,
      TokenConfirmation,
      Role,
      Permission,
      NationalIdentity,
      NotificationScope,
      UserNotificationPreference,
      RolePermissions,
    ]),
  ],
  controllers: [UserController],
  providers: [
    PushNotificationService,
    UserTrackingRepository,
    UserTrackingService,
    UserService,
    UserRepository,
    UserConfirmationRepository,
    UserResolver,
    RoleResolver,
    RoleService,
    RoleRepository,
    PermissionRepository,
    UserEventHandler,
    NationalIdentityRepository,
    UserNotificationRepository,
    NotificationScopeRepository,
    RolePermissionRepository,
    NafathLogsRepository,
    NafathService,
  ],

  exports: [
    UserService,
    UserRepository,
    RoleService,
    NotificationScopeRepository,
  ],
})
export class UserModule {}
