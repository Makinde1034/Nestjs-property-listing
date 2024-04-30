/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AccessTokenGuard, PermissionsGuard } from '../../auth/guards';
import { Staff, User } from 'src/entities';
import { UserService } from '../services/user.service';
import { CreateStaffInput, ProfileInput, StaffConfirmDto } from '../dtos';
import { Permissions } from 'src/common/decorator/permission';

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

  /**
   * Create Staff User Profile
   *
   * @async
   * @param {ProfileInput} inputDto
   * @returns {Promise<User>}
   */
  @Mutation(() => Staff)
  @Permissions('create-user')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async createStaff(
    @Args('RequestInput') inputDto: CreateStaffInput,
  ): Promise<User> {
    return await this.userService.createStaff(inputDto);
  }

  /**
   * Confirm Staff And Set new Password
   *
   * @async
   * @param {StaffConfirmDto} inputDto
   * @returns {Promise<User>}
   */
  @Mutation(() => String)
  async staffConfirmation(
    @Args('RequestInput') inputDto: StaffConfirmDto,
  ): Promise<string> {
    return await this.userService.staffPasswordConfirmation(inputDto);
  }
}
