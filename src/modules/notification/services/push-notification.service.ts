/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as firebase from 'firebase-admin';

import {
  PushNotificationinput,
  PushNotificationPayload,
} from 'src/common/interface';

import { SuccessResponse } from '../../../common/utils/success.response';
import { NotificationTokenRepository } from '../repositories/notification-token.repository';
import { ConfigService } from '@nestjs/config';
import {
  FireBaseConfig,
  getFireBaseConfigName,
} from '../../../config/serviceAccount/firebase.config';

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);
  private readonly firebaseConfig: FireBaseConfig;

  private messaging: firebase.messaging.Messaging;

  constructor(
    private readonly notificationTokenRepository: NotificationTokenRepository,

    private readonly configService: ConfigService, // Inject ConfigService
  ) {
    this.firebaseConfig = this.configService.get<FireBaseConfig>(
      getFireBaseConfigName(),
    );
    // Fetch Firebase Config
    if (!firebase.apps.length) {
      firebase.initializeApp({
        credential: firebase.credential.cert({
          projectId: this.firebaseConfig.projectId,
          clientEmail: this.firebaseConfig.email,
          privateKey: this.firebaseConfig.key,
        }),
      });
    }
    this.messaging = firebase.messaging();
  }
  /**
   * Update User Profile
   * @async
   * @param {PushNotificationPayload} notification
   * @returns {Promise<void>}
   */
  async sendPushNotification(
    notification: PushNotificationPayload,
  ): Promise<void> {
    try {
      const data = {
        title: notification.title,
        message: notification.message,
        userId: notification.userId,
        deepLink: notification.redirectLink,
      };

      const message: firebase.messaging.Message = {
        token: notification.notificationToken,
        notification: {
          imageUrl: notification.img,
          title: notification.title,
          body: notification.message,
        },
        data,
      };
      await this.messaging.send(message);
      this.logger.log('Push notification sent');
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException('Failed to send push notification');
    }
  }

  async configureNotification(
    notification: PushNotificationinput,
    userId: string,
  ) {
    try {
      const userNotificationToken =
        await this.notificationTokenRepository.findOne({
          where: {
            userId: userId,
          },
        });

      if (!userNotificationToken) {
        await this.notificationTokenRepository.save({
          status: false,
          token: notification.notificationToken,
          userId: userId,
          deviceType: notification.deviceType,
        });
        return new SuccessResponse();
      }
      if (userNotificationToken?.deviceType != notification.deviceType) {
        await this.notificationTokenRepository.update(
          userNotificationToken.id,
          {
            token: notification.notificationToken,
            deviceType: notification.deviceType,
          },
        );
      }
      return new SuccessResponse();
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }
}
