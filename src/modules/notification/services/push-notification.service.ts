/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable, Logger } from '@nestjs/common';
import * as firebase from 'firebase-admin';
import { PushNotificationPayload } from 'src/common/interface';
import StorageConfig from '../../../database/seeders/config/serviceAccount/storage-config';

firebase.initializeApp({
  credential: firebase.credential.cert({
    projectId: StorageConfig.projectId,
    clientEmail: StorageConfig.clientEmail,
    privateKey: StorageConfig.privateKey,
  }),
});

@Injectable()
export class PushNotificationService {
  private logger = new Logger(PushNotificationService.name);

  /**
   * Update User Profile
   *
   * @async
   * @param {PushNotificationPayload} notification
   * @returns {Promise<void>}
   */
  async sendPushNotification(
    notification: PushNotificationPayload,
  ): Promise<void> {
    const androidConfig: firebase.messaging.AndroidConfig = {
      priority: 'high',
    };

    const data = {
      title: notification.title,
      message: notification.message,
      userId: notification.userId,
      deepLink: notification.redirectLink,
    };
    const message: firebase.messaging.Message = {
      token: notification.notificationToken,
      data,
      android: androidConfig,
      apns: {
        payload: {
          aps: {
            alert: {
              title: notification.title,
              body: notification.message,
            },
            sound: 'default',
            badge: 1,
          },
        },
      },
      webpush: {
        data,
        fcmOptions: {
          link: notification.redirectLink,
        },
      },
    };

    await firebase
      .messaging()
      .send(message)
      .then((response) => {
        this.logger.log('Successfully sent message:', response);
      })
      .catch((error) => {
        this.logger.debug('error code:', error.code);

        this.logger.debug('Error sending notification:', error);
      });
  }
}
