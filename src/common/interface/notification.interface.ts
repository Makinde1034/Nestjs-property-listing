/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { NotificationScope } from '../../entities';

export interface EmailNotificationPayload {
  title: string;
  message: string;
}
export interface PushNotificationPayload extends EmailNotificationPayload {
  deviceType: string;
  notificationToken: string;
  redirectLink?: string;
  userId: string;
}

@InputType()
export class PushNotificationinput {
  @Field()
  deviceType: string;
  @Field()
  notificationToken: string;
}

export interface NotificationEventInput {
  title: string;
  message: string;
  recipients: string[];
  isEmail: boolean;
  isPushNotification: boolean;
  deepLink?: string;
  data?: SendNotificationInput;
}

export interface SendNotificationInput {
  creatorId: string;
  receiverId?: string;
  scope: NotificationScope;
  event: string;
  recipientFormat?: [string, string];
  type: string;
  count?: number;
}
