/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

export interface EmailNotificationPayload {
  title: string;
  message: string;
}

export interface PushNotificationPayload extends EmailNotificationPayload {
  notificationToken: string;
  redirectLink?: string;
  userId: string;
}

export interface NotificationEventInput {
  title: string;
  message: string;
  recipients: string[];
  isEmail: boolean;
  isPushNotification: boolean;
  deepLink?: string;
}
