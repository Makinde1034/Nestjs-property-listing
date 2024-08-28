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
import { CustomerService } from './services/customer.service';
import { StaffService } from './services/staff.service';

@Global()
@Module({
  imports: [
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
    CustomerService,
    StaffService,
  ],
  exports: [
    UserService,
    UserRepository,
    RoleService,
    RoleRepository,
    NotificationScopeRepository,
  ],
})
export class UserModule {}
