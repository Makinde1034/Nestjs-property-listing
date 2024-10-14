/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from '../repositories';
import { NotificationEventDto, NotificationInput } from '../dtos';
import {
  Notification,
  NotificationScope,
  User,
  UserNotificationPreference,
} from 'src/entities';
import {
  UserRepository,
  NotificationScopeRepository,
} from '../../user/repositories';
import { AppStrings } from 'src/common/messages/app.strings';
import { MailgunEmailService } from '../../mail/services/implementations';
import {
  EmailNotificationPayload,
  NotificationEventInput,
  PushNotificationPayload,
  SendNotificationInput,
} from 'src/common/interface';
import { PushNotificationService } from './push-notification.service';
import { NotificationEvent, NotificationType } from 'src/common/enums';
import { In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getMessageData } from '../../../common/messages/alert-messages';
import { NotificationScopesEnum } from '../../../common/enums/notification-scope.enum';
import { MailInput } from '../../mail/mail.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly userRepository: UserRepository,
    private readonly notificationScopeRepository: NotificationScopeRepository,
    private readonly mailService: MailgunEmailService,
    private readonly pushNotificationService: PushNotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Send Notification Message
   * @param {NotificationInput} notificationInput
   * @returns {Promise<string>}
   */
  sendUsersNotification(notificationInput: NotificationInput): string {
    const {
      recipients,
      isEmail,
      isPushNotification,
      title,
      message,
      deepLink,
    } = notificationInput;
    this.eventEmitter.emit(
      NotificationEvent.SEND_NOTIFICATION,
      new NotificationEventDto({
        recipients,
        isEmail,
        isPushNotification,
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
    try {
      const {
        recipients,
        isEmail,
        isPushNotification,
        title,
        message,
        deepLink,
      } = notification;
      const users = await this.userRepository.find({
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

          if (isPushNotification) {
            // Send EMail notification
            await this.sendPushNotification(pushNotificationData);
          }

          const notificationLog: Partial<Notification> = {
            ...emailData,
            recipient: user,
            type: this.getNotificationType(isEmail, isPushNotification),
          };
          await this.saveNotificationLog(notificationLog);
        }),
      );
    } catch (error) {
      this.logger.error(error);
    }
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
    return await this.notificationRepository.save(data);
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
    user?: User,
    data?: EmailNotificationPayload,
    category?: string,
    mailInput?: MailInput,
  ): Promise<void> {
    switch (category) {
      case 'offer':
        await this.mailService.sendOfferMail(mailInput);
        break;

      default:
        await this.mailService.sendEmailNotification(user, data);

        break;
    }
  }

  /**
   * Mark Notification as read
   *
   * @async
   * @param {string} id
   * @returns {Promise<Notification>}
   */
  async updateNotification(id: string): Promise<Notification> {
    const { affected } = await this.notificationRepository.update(id, {
      read: true,
    });

    if (affected) {
      return await this.notificationRepository.findOneBy({ id });
    }
  }

  /**
   * List user's Notification
   *
   * @async
   * @param {User} user
   * @returns {Promise<Notification[]>}
   */
  async find(user: User): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { recipient: { id: user.id } },
    });
  }
  /**
   * List system NotificationScopes
   *
   * @async
   * @returns {Promise<NotificationScope[]>}
   */
  async listNotificationScopes(): Promise<NotificationScope[]> {
    return await this.notificationScopeRepository.find();
  }

  async sendNotification(notificationInput: SendNotificationInput) {
    try {
      const { creatorId, receiverId, scope, event, recipientFormat, count } =
        notificationInput;

      // Get user information for buyer and seller along with their notification preferences
      const [buyer, seller] = await Promise.all([
        this.userRepository.findOneOrFail({
          where: { id: creatorId },
          relations: ['notificationPreference'],
        }),

        this.userRepository.findOneOrFail({
          where: { id: receiverId },
          relations: ['notificationPreference'],
        }),
      ]);

      // Get the preferences for both buyer and seller

      const userPrefBuyer = buyer.notificationPreference.find(
        (pref) => pref.scope.id === scope.id,
      );
      const userPrefSeller = seller.notificationPreference.find(
        (pref) => pref.scope.id === scope.id,
      );

      const scopeName = scope.name as NotificationScopesEnum;

      // Define scopes that trigger notifications
      const notificationScopes = [
        NotificationScopesEnum.CREATE_OFFER,
        NotificationScopesEnum.UPDATE_OFFER,
        NotificationScopesEnum.ACCEPTED,
        NotificationScopesEnum.RESPONSE,
        NotificationScopesEnum.UPCOMING_EVENTS,
      ];

      // If scope matches one of the predefined notification scopes, send the notification
      if (notificationScopes.includes(scopeName)) {
        this.SendNotificationBasedOnPreference(
          userPrefBuyer,
          userPrefSeller,
          seller,
          buyer,
          event,
          scope.name,
          recipientFormat,
          notificationInput.type,
          count,
        );
      }
    } catch (error) {
      this.logger.error('Error sending notification:', error);
      throw error; // Optional: throw to let calling service handle it
    }
  }

  //TODO: use Event emmiter
  SendNotificationBasedOnPreference(
    userPrefRecipients?: UserNotificationPreference,
    userPrefOwner?: UserNotificationPreference,
    owner?: User,
    recipient?: User,
    event?: string,
    scope?: string,
    recipientFormat?: [string, string],
    type?: string,
    countInEnglish?: number,
  ) {
    try {
      /************************
       * Email Notification
       ************************/

      if (userPrefRecipients?.email) {
        this.logger.log('Sending notifications');
        this.logger.log('here');
        this.sendEmailToUser(
          recipient,
          event,
          scope,
          recipientFormat[1],
          type,
          null,
          countInEnglish,
        );
      }

      if (userPrefOwner?.email) {
        this.logger.log('Sending notifications');
        this.sendEmailToUser(
          owner,
          event,
          scope,
          recipientFormat[0],
          type,
          recipient,
        );
      }

      /************************
       * Push Notification
       ************************/
      if (userPrefRecipients?.mobile) {
        this.logger.log('Sending notifications');
        this.sendPushNotificationToUser(
          recipient,
          event,
          scope,
          recipientFormat[1],
        );
      }

      if (userPrefOwner?.mobile) {
        this.logger.log('Sending notifications');
        this.sendPushNotificationToUser(
          owner,
          event,
          scope,
          recipientFormat[0],
          recipient,
        );
      }

      /************************
       * Web Notification (future)
       ************************/
      // Add web notification logic when needed
    } catch (error) {
      this.logger.error('Error sending notifications', error);
      throw new BadRequestException(error);
    }
  }

  /**
   * Helper method to send email notification.
   */
  private sendEmailToUser(
    user: User,
    event: string,
    scope: string,
    format: string,
    type: string,
    additionalUser?: User,
    countInEnglish?: number,
  ) {
    if (user) {
      const messageData = getMessageData(
        user.firstName,
        user.arabicFirstName,
        event,
        scope,
        format,
        countInEnglish,
      );

      const subject: string =
        user.language === 'en'
          ? messageData[0]?.title
          : messageData[0]?.arabicTitle;
      const text =
        user.language === 'en'
          ? messageData[0]?.body
          : messageData[0]?.arabicBody;
      this.sendEmailNotification(
        user,
        {
          title: subject,
          message: text,
        },
        type,
        null,
      );
    }
  }

  /**
   * Helper method to send push notification.
   */
  private sendPushNotificationToUser(
    user: User,
    event: string,
    scope: string,
    format: string,
    additionalUser?: User,
  ) {
    const messageData = getMessageData(
      user.firstName,
      user.arabicFirstName,
      event,
      scope,
      format,
    );

    const title =
      user.language === 'en'
        ? messageData[0].title
        : messageData[0].arabicTitle;
    const message =
      user.language === 'en' ? messageData[0].body : messageData[0].arabicBody;

    this.sendUsersNotification({
      recipients: [user.id],
      isPushNotification: true,
      isEmail: false,
      title,
      message,
    });
  }
}
