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
} from '../../entities';
import {
  UserConfirmationRepository,
  UserRepository,
  RoleRepository,
  PermissionRepository,
  NationalIdentityRepository,
  NotificationScopeRepository,
  UserNotificationRepository,
} from './repositories';
import { UserResolver, RoleResolver } from './resolvers';
import { UserController } from './controllers';
import { UserEventHandler } from './events';

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
    ]),
  ],
  controllers: [UserController],
  providers: [
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
  ],
  exports: [
    UserService,
    UserRepository,
    RoleService,
    NotificationScopeRepository,
  ],
})
export class UserModule {}
