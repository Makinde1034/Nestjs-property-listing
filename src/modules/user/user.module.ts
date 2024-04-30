/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Module } from '@nestjs/common';
import { UserService, RoleService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission, Role, TokenConfirmation, User } from '../../entities';
import {
  UserConfirmationRepository,
  UserRepository,
  RoleRepository,
  PermissionRepository,
} from './repositories';
import { UserResolver, RoleResolver } from './resolvers';
import { UserController } from './controllers';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, TokenConfirmation, Role, Permission]),
  ],
  providers: [
    UserService,
    UserRepository,
    UserConfirmationRepository,
    UserResolver,
    RoleResolver,
    RoleService,
    RoleRepository,
    PermissionRepository,
  ],
  exports: [UserService, UserRepository],
  controllers: [UserController],
})
export class UserModule {}
