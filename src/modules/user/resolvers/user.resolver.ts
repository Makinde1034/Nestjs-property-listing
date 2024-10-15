/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AccessTokenGuard, PermissionsGuard } from '../../auth/guards';
import { User } from 'src/entities';
import { UserService } from '../services/user.service';

import { Permissions } from 'src/common/decorator/permission';
import { SuccessResponse } from '../../../common/utils/success.response';
import {
  AssignRoleInput,
  CreateStaffInput,
  DeleteUserInput,
  NotificationPrefenceInput,
  PasswordInput,
  StaffConfirmDto,
  UpdateUserData,
  UserActionInput,
  UserProfileInput,
} from '../dtos/request';
import { UserFilter } from '../dtos/request/user';
import { UserResponse } from '../dtos/response/user.response';
import { AdminGuard } from '../../auth/guards/admin.guard';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  /**
   * User
   *
   * @returns { Promise<User>}
   */
  @Query(() => User, { name: 'user' })
  @UseGuards(AccessTokenGuard)
  async getUser(@Context() ctx): Promise<User> {
    return await this.userService.findUserById(ctx.req.user.id, ['roles']);
  }

  @Query(() => User, { name: 'getOneUser' })
  @UseGuards(AccessTokenGuard)
  async getOneUser(@Args('id') id: string) {
    return await this.userService.findUserById(id, ['roles']);
  }

  @Query(() => [User], { name: 'searchForUsers' })
  @UseGuards(AccessTokenGuard)
  async searchForUser(@Args('searchParam') searchParam: string) {
    return await this.userService.searchForUsers(searchParam);
  }

  @Query(() => UserResponse, { name: 'findAllUser' })
  @UseGuards(AccessTokenGuard)
  async findAllUser(@Args('userFilterInput') userFilterInput: UserFilter) {
    return await this.userService.findAllUser(userFilterInput);
  }

  @Query(() => UserResponse, { name: 'getEmployees' })
  @UseGuards(AccessTokenGuard)
  async getEmployees(
    @Context() ctx: any,
    @Args('userFilterInput', { nullable: true }) userFilterInput: UserFilter,
  ) {
    return await this.userService.getEmployees(userFilterInput);
  }

  @Query(() => UserResponse, { name: 'findAllCustomers' })
  @UseGuards(AdminGuard)
  @UseGuards(AccessTokenGuard)
  async findAllCustomers(@Args('userFilterInput') userFilterInput: UserFilter) {
    return await this.userService.findAllCustomers(userFilterInput);
  }

  /**
   * Update User Profile
   *
   * @async
   * @param {any} ctx
   * @param {UserProfileInput} inputDto
   * @returns {Promise<User>}
   */
  @Mutation(() => User, { name: 'profileUpdate' })
  @UseGuards(AccessTokenGuard)
  async updateProfile(
    @Args('RequestInput') inputDto: UserProfileInput,
    @Context() ctx: any,
  ): Promise<User> {
    return await this.userService.updateProfile(ctx.req.user, inputDto);
  }

  @UseGuards(AccessTokenGuard, AdminGuard)
  @Mutation(() => SuccessResponse)
  async resetPasswordAdmin(
    @Args('ResetInput') ResetInput: UserActionInput,
  ): Promise<SuccessResponse> {
    return await this.userService.resetPassword(ResetInput);
  }

  /**
   * Create Staff User Profile
   * @async
   * @param {CreateStaffInput} inputDto
   * @returns {Promise<User>}
   */
  @Mutation(() => User)
  @Permissions('create-user')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async createStaff(
    @Args('RequestInput') inputDto: CreateStaffInput,
  ): Promise<User> {
    return await this.userService.createStaff(inputDto);
  }

  /**
   * Confirm Staff And Set new Password
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

  /**
   * Block User
   *
   * @async
   * @param {UserActionInput} inputDto
   * @returns {Promise<User>}
   */
  @Mutation(() => SuccessResponse)
  @UseGuards(AccessTokenGuard)
  async blockUser(
    @Args('RequestInput') inputDto: UserActionInput,
  ): Promise<SuccessResponse> {
    return await this.userService.blockUser(inputDto);
  }

  @Mutation(() => SuccessResponse)
  @UseGuards(AccessTokenGuard)
  async deleteUser(
    @Args('RequestInput') inputDto: DeleteUserInput,
  ): Promise<SuccessResponse> {
    return await this.userService.deleteUser(inputDto);
  }

  @Mutation(() => User)
  @UseGuards(AccessTokenGuard)
  async updateNotificationPreference(
    @Context() ctx: any,
    @Args('RequestInput') inputDto: NotificationPrefenceInput,
  ): Promise<User> {
    return await this.userService.updateNotificationPreference(
      ctx.req.user,
      inputDto,
    );
  }

  /**
   * Update User Password
   *
   * @async
   * @param {any} ctx
   * @param {PasswordInput} inputDto
   * @returns {Promise<User>}
   */
  @Mutation(() => User)
  @UseGuards(AccessTokenGuard)
  async changePassword(
    @Args('RequestInput') inputDto: PasswordInput,
    @Context() ctx: any,
  ): Promise<User> {
    return await this.userService.changePassword(ctx.req.user, inputDto);
  }
  @Mutation(() => User, { name: 'updateUserData' })
  @UseGuards(AccessTokenGuard)
  @UseGuards(AdminGuard)
  async updateUserData(
    @Args('updateUserInput') updateUserInput: UpdateUserData,
  ): Promise<User> {
    return await this.userService.updateUserData(updateUserInput);
  }

  @Mutation(() => User, { name: 'assignRoleToUser' })
  @UseGuards(AccessTokenGuard)
  @UseGuards(AdminGuard)
  async assignRoleToUser(
    @Args('assignRoleInput') assignRoleInput: AssignRoleInput,
  ): Promise<User> {
    return await this.userService.assignRoleToUser(assignRoleInput);
  }
}
