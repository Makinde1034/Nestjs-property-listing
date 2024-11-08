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
import { Public } from '../../auth/decorators/permision.decorator';
import {
  NafathAuthenticationResponseToUser,
  UserUpgradeInput,
} from '../dtos/response/nafath';
import { PermissionsEnum } from '../../../common/enums/permission.enum';
@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}
  /**
   * User
   * @returns { Promise<User>}
   */
  @Query(() => User, { name: 'user' })
  @UseGuards(AccessTokenGuard)
  @Public()
  async getUser(@Context() ctx): Promise<User> {
    return await this.userService.findUserById(ctx.req.user.id, ['roles']);
  }

  @Query(() => User, { name: 'getOneUser' })
  @UseGuards(AccessTokenGuard)
  @Permissions(PermissionsEnum.USER_MANAGEMENT_VIEW)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async getOneUser(@Args('id') id: string) {
    return await this.userService.findUserById(id, ['roles']);
  }

  @Query(() => [User], { name: 'searchForUsers' })
  @UseGuards(AccessTokenGuard)
  @Permissions(PermissionsEnum.USER_MANAGEMENT_VIEW)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async searchForUser(@Args('searchParam') searchParam: string) {
    return await this.userService.searchForUsers(searchParam);
  }

  @Query(() => [User], { name: 'searchForEmployee' })
  @UseGuards(AccessTokenGuard)
  @Permissions(PermissionsEnum.USER_MANAGEMENT_VIEW)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async searchForEmployee(@Args('searchParam') searchParam: string) {
    return await this.userService.searchForEmployee(searchParam);
  }

  @Query(() => UserResponse, { name: 'findAllUser' })
  @UseGuards(AccessTokenGuard)
  @Permissions(PermissionsEnum.USER_MANAGEMENT_VIEW)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async findAllUser(@Args('userFilterInput') userFilterInput: UserFilter) {
    return await this.userService.findAllUser(userFilterInput);
  }
  @Query(() => UserResponse, { name: 'getEmployees' })
  @UseGuards(AccessTokenGuard)
  @Permissions(PermissionsEnum.USER_MANAGEMENT_VIEW)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async getEmployees(
    @Context() ctx: any,
    @Args('userFilterInput', { nullable: true }) userFilterInput: UserFilter,
  ) {
    return await this.userService.getEmployees(userFilterInput);
  }

  @Query(() => UserResponse, { name: 'findAllCustomers' })
  @Permissions(PermissionsEnum.USER_MANAGEMENT_VIEW)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
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

  @Mutation(() => SuccessResponse, { name: 'updateTerm' })
  @Public()
  @UseGuards(AccessTokenGuard)
  async updateTerm(@Context() ctx: any): Promise<SuccessResponse> {
    return await this.userService.updateTerm(ctx.req.user);
  }

  @Mutation(() => SuccessResponse, { name: 'forceUpdate' })
  @UseGuards(AccessTokenGuard)
  async forceUpdate(
    @Context() ctx: any,
    @Args('version') version: string,
  ): Promise<SuccessResponse> {
    return await this.userService.forceUpdate(version);
  }

  @Permissions(PermissionsEnum.USER_MANAGEMENT_RESET_PASSWORD)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Mutation(() => SuccessResponse)
  async resetPasswordAdmin(
    @Args('ResetInput') ResetInput: UserActionInput,
    @Context() ctx: any,
  ): Promise<SuccessResponse> {
    return await this.userService.resetPassword(ResetInput, ctx.req.user);
  }

  /**
   * Create Staff User Profile
   * @async
   * @param {CreateStaffInput} inputDto
   * @returns {Promise<User>}
   */
  @Mutation(() => SuccessResponse)
  @Permissions(PermissionsEnum.USER_MANAGEMENT_CREATE)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async createStaff(
    @Args('RequestInput') inputDto: CreateStaffInput,
    @Context() ctx: any,
  ): Promise<SuccessResponse> {
    return await this.userService.createStaff(inputDto, ctx.req.user);
  }

  /**
   * Confirm Staff And Set new Password
   * @async
   * @param {StaffConfirmDto} inputDto
   * @returns {Promise<User>}
   */
  @Mutation(() => String)
  @UseGuards(AccessTokenGuard)
  async staffConfirmation(
    @Args('RequestInput') inputDto: StaffConfirmDto,
  ): Promise<string> {
    return await this.userService.staffPasswordConfirmation(inputDto);
  }

  /**
   * Confirm Staff And Set new Password
   * @async

   * @returns {}
   */
  @Mutation(() => NafathAuthenticationResponseToUser)
  async upgradeUser(
    @Args('userUpgradeInput') userUpgradeInput: UserUpgradeInput,
    @Context() ctx: any,
  ): Promise<NafathAuthenticationResponseToUser> {
    return await this.userService.verifyUser(userUpgradeInput, ctx.req.user);
  }
  /**
   * Block User
   *
   * @async
   * @param {UserActionInput} inputDto
   * @returns {Promise<User>}
   */
  @Mutation(() => SuccessResponse)
  @Permissions(PermissionsEnum.USER_MANAGEMENT_EDIT_STATUS)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async blockUser(
    @Args('RequestInput') inputDto: UserActionInput,
    @Context() ctx: any,
  ): Promise<SuccessResponse> {
    return await this.userService.blockUser(inputDto, ctx.req.user);
  }

  @Mutation(() => SuccessResponse)
  @Permissions(PermissionsEnum.USER_MANAGEMENT_DELETE)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async deleteUser(
    @Args('RequestInput') inputDto: DeleteUserInput,
    @Context() ctx: any,
  ): Promise<SuccessResponse> {
    return await this.userService.deleteUser(inputDto, ctx.req.user);
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
    @Context() ctx: any,
  ): Promise<User> {
    return await this.userService.updateUserData(updateUserInput, ctx.req.user);
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
