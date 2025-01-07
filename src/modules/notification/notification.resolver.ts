/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NotificationService } from './services';
import {
  Notification,
  NotificationScope,
  UserNotificationPreference,
} from 'src/entities';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard, PermissionsGuard } from '../auth/guards';
import {
  CreateNotificationMessage,
  CreateNotificationScopeInput,
  NotificationInput,
  UpdateAdminNotificationPreferenceScope,
  UpdateAdminNotificationScope,
  UpdateNotificationMessage,
  UpdateNotificationMessageScope,
} from './dtos';
import { SuccessResponse } from '../../common/utils/success.response';
import { PermissionsEnum } from '../../common/enums/permission.enum';
import { Permissions } from '../../common/decorator/permission';
import { NotificationMessages } from '../../entities/notification-message.entity';

@Resolver()
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * List user's notification
   *
   * @async
   * @param {any} ctx
   * @returns {Promise<Notification[]>}
   */
  @Query(() => [Notification])
  @UseGuards(AccessTokenGuard)
  async listNotifications(@Context() ctx): Promise<Notification[]> {
    return await this.notificationService.find(ctx.req.user);
  }
  @Query(() => SuccessResponse)
  @UseGuards(AccessTokenGuard)
  async deleteNotification(@Context() ctx): Promise<SuccessResponse> {
    return await this.notificationService.deleteNotification(ctx.req.user);
  } /**
   * List user's notification
   *
   * @async
   * @param {any} ctx
   * @returns {Promise<Notification[]>}
   */
  @Query(() => [UserNotificationPreference])
  @UseGuards(AccessTokenGuard)
  async listNotificationScopesForUser(@Context() ctx) {
    return await this.notificationService.listNotificationScopesForUser(
      ctx.req.user,
    );
  }

  /**
   * Mark Notification as read
   *
   * @async
   * @param {any} ctx
   * @param {string} id
   * @returns {Promise<Notification>}
   */
  @Mutation(() => Notification)
  @UseGuards(AccessTokenGuard)
  async markNotificationAsRead(
    @Context() ctx: any,
    @Args('id') id: string,
  ): Promise<Notification> {
    return await this.notificationService.updateNotification(id);
  }

  @Mutation(() => SuccessResponse)
  @UseGuards(AccessTokenGuard)
  async markAllAsRead(@Context() ctx: any): Promise<SuccessResponse> {
    return await this.notificationService.markAllAsRead(ctx.req.user);
  }

  /**
   * Send User's Notifications
   *
   * @async
   * @param {NotificationInput} RequestInput
   * @returns {Promise<Notification>}
   */
  @Mutation(() => String)
  @UseGuards(AccessTokenGuard)
  sendNotification(
    @Args('requestInput') requestInput: NotificationInput,
  ): string {
    return this.notificationService.sendUsersNotification(requestInput);
  }

  @Mutation(() => SuccessResponse)
  @UseGuards(AccessTokenGuard)
  updateNotificationScope(
    @Args('requestInput') requestInput: UpdateAdminNotificationScope,
  ): Promise<SuccessResponse> {
    return this.notificationService.updateNotificationScope(requestInput);
  }

  @Mutation(() => NotificationScope)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.SYSTEM_SETTINGS_EDIT)
  async createAdminNotificationScope(
    @Args('requestInput') requestInput: CreateNotificationScopeInput,
  ): Promise<NotificationScope> {
    return await this.notificationService.createAdminNotificationScopePreference(
      requestInput,
    );
  }

  @Mutation(() => SuccessResponse)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.SYSTEM_SETTINGS_EDIT)
  async updateAdminNotificationPreference(
    @Args('requestInput') requestInput: UpdateAdminNotificationPreferenceScope,
  ): Promise<SuccessResponse> {
    return this.notificationService.updateAdminNotificationScopePreference(
      requestInput,
    );
  }

  @Mutation(() => SuccessResponse)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.SYSTEM_SETTINGS_EDIT)
  async updateNotificationMessage(
    @Args('updateNotificationMessageInput')
    updateNotificationMessageInput: UpdateNotificationMessage,
  ): Promise<SuccessResponse> {
    return this.notificationService.updateNotificationMessage(
      updateNotificationMessageInput,
    );
  }

  @Mutation(() => SuccessResponse)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.SYSTEM_SETTINGS_EDIT)
  async createNotificationMessage(
    @Args('updateNotificationMessage')
    createNotificationMessageInput: CreateNotificationMessage,
  ): Promise<SuccessResponse> {
    return this.notificationService.addNotificationMessage(
      createNotificationMessageInput,
    );
  }
  @Mutation(() => SuccessResponse)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.SYSTEM_SETTINGS_EDIT)
  async updateNotificationMessageScope(
    @Args('updateNotificationMessage')
    updateNotificationMessage: UpdateNotificationMessageScope,
  ): Promise<SuccessResponse> {
    return this.notificationService.updateNotificationMessageScope(
      updateNotificationMessage,
    );
  }
  /**
   * List notification scopes
   * @async
   * @returns {Promise<NotificationScope[]>}
   */
  @Query(() => [NotificationScope])
  @UseGuards(AccessTokenGuard)
  async listNotificationScopes(): Promise<NotificationScope[]> {
    return await this.notificationService.listNotificationScopes();
  }

  @Query(() => [NotificationMessages])
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.SYSTEM_SETTINGS_VIEW)
  async findNotificationControl(): Promise<NotificationMessages[]> {
    return await this.notificationService.findNotificationControl();
  }

  @Query(() => NotificationMessages)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.SYSTEM_SETTINGS_VIEW)
  async findOneNotificationControl(
    @Args('id') id: string,
  ): Promise<NotificationMessages> {
    return await this.notificationService.findOneNotificationControl(id);
  }
}
