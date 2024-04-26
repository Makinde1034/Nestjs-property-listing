/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

export enum NotificationType {
  EMAIL_NOTIFICATION = 'Email',
  PUSH_NOTIFICATION = 'Push Notification',
  SYSTEM_NOTIFICATION = 'System Notification',
  ALL = 'All',
}

export enum NotificationEvent {
  SEND_NOTIFICATION = 'send.notification',
}
