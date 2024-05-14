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
} from '../../entities';
import {
  UserConfirmationRepository,
  UserRepository,
  RoleRepository,
  PermissionRepository,
  NationalIdentityRepository,
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
  ],
  exports: [UserService, UserRepository, RoleService],
})
export class UserModule {}
