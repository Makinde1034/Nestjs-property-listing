/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenConfirmation, User } from '../../entities';
import { UserConfirmationRepository, UserRepository } from './repositories';
import { UserResolver } from './user.resolver';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, TokenConfirmation])],
  providers: [
    UserService,
    UserRepository,
    UserConfirmationRepository,
    UserResolver,
  ],
  exports: [UserService, UserRepository],
  controllers: [UserController],
})
export class UserModule {}
