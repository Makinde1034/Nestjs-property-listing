/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from '../repositories';
import { NotificationEventDto, NotificationInput } from '../dtos';
import { Notification, User } from 'src/entities';
import { UserRepository } from 'src/modules/user/repositories';
import { AppStrings } from 'src/common/messages/app.strings';
import { MailgunEmailService } from '../../mail/services/implementations';
import {
  EmailNotificationPayload,
  NotificationEventInput,
  PushNotificationPayload,
} from 'src/common/interface';
import { PushNotificationService } from './push-notification.service';
import { NotificationEvent, NotificationType } from 'src/common/enums';
import { In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly userRepository: UserRepository,
    private readonly mailService: MailgunEmailService,
    private readonly pushNotificationService: PushNotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Send Notification Message
   *
   * @param {NotificationInput} notificationInput
   * @returns {Promise<string>}
   */
  sendUsersNotification(notificationInput: NotificationInput): string {
    const { recipients, isEmail, isPushNotifcation, title, message, deepLink } =
      notificationInput;
    this.eventEmitter.emit(
      NotificationEvent.SEND_NOTIFICATION,
      new NotificationEventDto({
        recipients,
        isEmail,
        isPushNotifcation,
        title,
        message,
        deepLink,
      }),
    );
    return AppStrings.NOTIFICATION_SENT_SUCCESSFULLY;
  }

  /**
   * Send Notification Message
   *
   * @async
   * @param {NotificationEventInput} notification
   * @returns {Promise<string>}
   */
  async handleNotificationEvent(
    notification: NotificationEventInput,
  ): Promise<void> {
    const { recipients, isEmail, isPushNotifcation, title, message, deepLink } =
      notification;
    const users = await this.userRepository.findAll({
      where: { id: In([...recipients]) },
    });
    await Promise.all(
      users.map(async (user) => {
        const emailData: EmailNotificationPayload = {
          title,
          message,
        };
        if (isEmail) {
          // Send EMail notification
          await this.sendEmailNotification(user, emailData);
        }

        const pushNotificationData: PushNotificationPayload = {
          ...emailData,
          notificationToken: user.notificationToken,
          redirectLink: deepLink,
          userId: user.id,
        };

        if (isPushNotifcation) {
          // Send EMail notification
          await this.sendPushNotification(pushNotificationData);
        }
        const notificationLog: Partial<Notification> = {
          ...emailData,
          recipient: user,
          type: this.getNotificationType(isEmail, isPushNotifcation),
        };
        await this.saveNotificationLog(notificationLog);
      }),
    );
  }

  /**
   * Get Notification type
   *
   * @param {boolean} isEmail
   * @param {boolean} isPushNotifcation
   * @returns {NotificationType}
   */
  getNotificationType(
    isEmail: boolean,
    isPushNotifcation: boolean,
  ): NotificationType {
    let notificationType: NotificationType;

    if (isEmail && isPushNotifcation) {
      notificationType = NotificationType.ALL;
    } else if (isEmail) {
      notificationType = NotificationType.EMAIL_NOTIFICATION;
    } else if (isPushNotifcation) {
      notificationType = NotificationType.PUSH_NOTIFICATION;
    } else {
      notificationType = NotificationType.SYSTEM_NOTIFICATION;
    }
    return notificationType;
  }

  /**
   * Save Notification Log
   *
   * @async
   * @param {Partial<Notification>} data
   * @returns {Promise<Notification>}
   */
  async saveNotificationLog(
    data: Partial<Notification>,
  ): Promise<Notification> {
    return await this.notificationRepository.create(data);
  }

  /**
   * Send Push Notification
   *
   * @async
   * @param {Partial<PushNotificationPayload>} data
   * @returns {Promise<void>}
   */
  async sendPushNotification(data: PushNotificationPayload): Promise<void> {
    await this.pushNotificationService.sendPushNotification(data);
  }

  /**
   * Send Email Notification
   *
   * @async
   * @param {User } user
   * @param {EmailNotificationPayload} data
   * @returns {Promise<void>}
   */
  async sendEmailNotification(
    user: User,
    data: EmailNotificationPayload,
  ): Promise<void> {
    await this.mailService.sendEmailNotification(user, data);
  }

  /**
   * Mark Notification as read
   *
   * @async
   * @param {string} id
   * @returns {Promise<Notification>}
   */
  async updateNotification(id: string): Promise<Notification> {
    return await this.notificationRepository.update(id, { read: true });
  }

  /**
   * List user's Notification
   *
   * @async
   * @param {User} user
   * @returns {Promise<Notification[]>}
   */
  async find(user: User): Promise<Notification[]> {
    return await this.notificationRepository.findAll({
      where: { recipient: { id: user.id } },
    });
  }
}
