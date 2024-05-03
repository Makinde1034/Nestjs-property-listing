/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Global, Module } from '@nestjs/common';
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
import { UserEventHandler } from './events';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User, TokenConfirmation, Role, Permission]),
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
  ],
  exports: [UserService, UserRepository, RoleService],
})
export class UserModule {}
