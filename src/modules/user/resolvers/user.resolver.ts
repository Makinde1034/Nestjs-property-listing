/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AccessTokenGuard, PermissionsGuard } from '../../auth/guards';
import { User } from 'src/entities';
import { UserService } from '../services/user.service';
import {
  CreateStaffInput,
  NotificationPrefenceInput,
  UserProfileInput,
  StaffConfirmDto,
  UserActionInput,
  PasswordInput,
  StaffFilterInput,
} from '../dtos';
import { Permissions } from 'src/common/decorator/permission';
import { EmployeeResponse } from '../dtos/response/staff.response';
import { SuccessResponseWithDataPayload } from '../../../common/utils/success.response';
import { StaffService } from '../services/staff.service';
import { CustomerService } from '../services/customer.service';

@Resolver()
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private staffService: StaffService,
    private customerService: CustomerService,
  ) {}

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

  /**
   * Create Staff User Profile
   *
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
    return await this.staffService.createStaff(inputDto);
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
    return await this.staffService.staffPasswordConfirmation(inputDto);
  }

  /**
   * Block User
   *
   * @async
   * @param {UserActionInput} inputDto
   * @returns {Promise<User>}
   */
  @Mutation(() => SuccessResponseWithDataPayload)
  @Permissions('update-user')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async blockUser(@Args('RequestInput') inputDto: UserActionInput) {
    return await this.userService.blockUser(inputDto);
  }

  /**
   * Update User Notification Preference
   *
   * @async
   * @param {any} ctx
   * @param {NotificationPrefenceInput} inputDto
   * @returns {Promise<User>}
   */
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

  @Query(() => EmployeeResponse)
  @UseGuards(AccessTokenGuard)
  async getEmployees(
    @Args('staffFilterInput') staffFilterInput: StaffFilterInput,
    @Context() ctx: any,
  ) {
    return await this.staffService.getEmployees(staffFilterInput, ctx.req.user);
  }

  @Query(() => User)
  @UseGuards(AccessTokenGuard)
  async getEmployee(@Args('id') id: string, @Context() ctx: any) {
    return await this.staffService.getOneEmployee(id, ctx.req.user);
  }
  //update password for multiple employees

  // delete multiple employees
}
