/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Module } from '@nestjs/common';
import { UserService, RoleService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Permission,
  Role,
  Staff,
  TokenConfirmation,
  User,
} from '../../entities';
import {
  UserConfirmationRepository,
  UserRepository,
  RoleRepository,
  PermissionRepository,
  StaffRepository,
} from './repositories';
import { UserResolver, RoleResolver } from './resolvers';
import { UserController } from './controllers';
import { UserEventHandler } from './events';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      TokenConfirmation,
      Role,
      Permission,
      Staff,
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
    StaffRepository,
    UserEventHandler,
  ],
  exports: [UserService, UserRepository, RoleService],
})
export class UserModule {}
