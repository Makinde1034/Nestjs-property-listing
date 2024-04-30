/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AccessTokenGuard } from '../../auth/guards';
import { User } from 'src/entities';
import { UserService } from '../services/user.service';
import { ProfileInput } from '../dtos';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  /**
   * User
   *
   * @returns {User}
   */
  @Query(() => User, { name: 'user' })
  @UseGuards(AccessTokenGuard)
  getUser(@Context() ctx) {
    return ctx.req.user;
  }

  /**
   * Update User Profile
   *
   * @async
   * @param {any} ctx
   * @param {ProfileInput} inputDto
   * @returns {Promise<User>}
   */
  @Mutation(() => User)
  @UseGuards(AccessTokenGuard)
  async updateProfile(
    @Context() ctx: any,
    @Args('ProfileInput') inputDto: ProfileInput,
  ): Promise<User> {
    return await this.userService.updateProfile(ctx.req.user, inputDto);
  }
}
