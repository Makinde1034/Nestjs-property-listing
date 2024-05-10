/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NotificationService } from './services';
import { Notification } from 'src/entities';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../auth/guards';
import { NotificationInput } from './dtos';

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
    @Args('RequestInput') RequestInput: NotificationInput,
  ): string {
    return this.notificationService.sendUsersNotification(RequestInput);
  }
}
