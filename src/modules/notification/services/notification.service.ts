/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable, Logger } from '@nestjs/common';
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
    user?: User,
    data?: EmailNotificationPayload,
    category?: string,
    mailInput?: MailInput,
  ): Promise<void> {
    switch (category) {
      case 'offer':
        await this.mailService.sendOfferMail(mailInput);
        break;

      case 'auction':
        break;

      case 'listing':
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

  /**
   * List system NotificationScopes
   *
   * @async
   * @returns {Promise<NotificationScope[]>}
   */
  async listNotificationScopes(): Promise<NotificationScope[]> {
    return await this.notificationScopeRepository.find();
  }

  async sendNotification(notificationInput: {
    creatorId: string;
    receiverId?: string;
    scope: NotificationScope;
  }) {
    //get user information for buyer and their notification preference
    const buyer = await this.userRepository.findOneOrFail({
      where: { id: notificationInput.creatorId },
      relations: ['notificationPreference'],
    });

    //get user information for seller and their notification preference

    const seller = await this.userRepository.findOneOrFail({
      where: { id: notificationInput.receiverId },
      relations: ['notificationPreference'],
    });

    //get the preference of a particular user
    const userPrefBuyer = buyer.notificationPreference.find((element) => {
      if (element.scope.id == notificationInput.scope.id) {
        return element;
      }
    });

    //get the preference of a particular user
    const userPrefSeller = seller.notificationPreference.find((element) => {
      if (element.scope.id == notificationInput.scope.id) {
        return element;
      }
    });

    //generate notification payload based on scope
    switch (notificationInput.scope.name) {
      case NotificationScopesEnum.CREATE_OFFER:
        this.SendNotificationBasedOnPreference(
          userPrefBuyer,
          userPrefSeller,
          seller,
          buyer,
        );
        break;

      case NotificationScopesEnum.CREATED:
        break;

      case NotificationScopesEnum.UPDATE_OFFER:
        break;

      case NotificationScopesEnum.ACCEPTED:
        break;

      default:
        break;
    }
  }

  //TODO: use Event emmiter
  async SendNotificationBasedOnPreference(
    userPrefBuyer: UserNotificationPreference,
    userPrefSeller: UserNotificationPreference,
    seller: User,
    buyer: User,
  ) {
    /************************
     * email notification
     ************************/
    if (userPrefBuyer?.email) {
      const mailMessageForBuyer = getMessageData(
        buyer.firstName,
        buyer.arabicFirstName,
        'Create',
        'Offers',
        'Offer Creator',
      );

      console.log('here', mailMessageForBuyer);

      this.sendEmailNotification(null, null, 'offer', {
        email: buyer.email,
        subject:
          buyer.language == 'en'
            ? mailMessageForBuyer[0]?.title
            : mailMessageForBuyer[0]['arabicTitle'],
        text:
          buyer.language == 'en'
            ? mailMessageForBuyer[0]['body']
            : mailMessageForBuyer[0]['arabicBody'],
      });
      this.mailService.sendOfferMail({
        email: buyer.email,
        subject:
          buyer.language == 'en'
            ? mailMessageForBuyer[0]['title']
            : mailMessageForBuyer[0]['arabicTitle'],
        text:
          buyer.language == 'en'
            ? mailMessageForBuyer[0]['body']
            : mailMessageForBuyer[0]['arabicBody'],
      });
    }

    if (userPrefSeller?.email) {
      const mailMessageForSeller = getMessageData(
        seller.arabicFirstName,
        'Create',
        'Offers',
        'Seller',
      );

      this.sendEmailNotification(null, null, 'offer', {
        email: buyer.email,
        subject:
          buyer.language == 'en'
            ? mailMessageForSeller[0]['title']
            : mailMessageForSeller[0]['arabicBody'],
        text:
          buyer.language == 'en'
            ? mailMessageForSeller[0]['body']
            : mailMessageForSeller[0]['arabicBody'],
      });
    }

    /************************
     * push notification
     ************************/

    if (userPrefBuyer?.mobile) {
      const mailMessageForBuyer = getMessageData(
        buyer.firstName,
        'Create',
        'Offers',
        'Offer Creator',
      );
      this.sendUsersNotification({
        recipients: [buyer.id],
        isPushNotification: true,
        isEmail: false,
        title:
          buyer.language == 'en'
            ? mailMessageForBuyer[0]['title']
            : mailMessageForBuyer[0]['arabicTitle'],
        message:
          buyer.language == 'en'
            ? mailMessageForBuyer[0]['body']
            : mailMessageForBuyer[0]['arabicBody'],
      });
    }

    if (userPrefSeller?.email) {
      const mailMessageForSeller = getMessageData(
        seller.arabicFirstName,
        'Create',
        'Offers',
        'Seller',
      );

      this.sendUsersNotification({
        recipients: [seller.id],
        isPushNotification: true,
        isEmail: false,
        title:
          buyer.language == 'en'
            ? mailMessageForSeller[0]['title']
            : mailMessageForSeller[0]['arabicBody'],
        message:
          buyer.language == 'en'
            ? mailMessageForSeller[0]['body']
            : mailMessageForSeller[0]['arabicBody'],
      });
    }

    /************************
     * web notification
     ************************/

    // if (userPrefBuyer?.desktop) {
    //   const mailMessageForBuyer = getMessageData(
    //     buyer.firstName,
    //     'Create',
    //     'Offers',
    //     'Offer Creator',
    //   );
    //   this.mailService.sendOfferMail({
    //     email: buyer.email,
    //     subject:
    //       buyer.language == 'en'
    //         ? mailMessageForBuyer[0]['title']
    //         : mailMessageForBuyer[0]['arabicTitle'],
    //     text:
    //       buyer.language == 'en'
    //         ? mailMessageForBuyer[0]['body']
    //         : mailMessageForBuyer[0]['arabicBody'],
    //   });
    // }

    // if (userPrefSeller?.desktop) {
    //   const mailMessageForSeller = getMessageData(
    //     seller.arabicFirstName,
    //     'Create',
    //     'Offers',
    //     'Seller',
    //   );

    //   this.mailService.sendOfferMail({
    //     email: buyer.email,
    //     subject:
    //       buyer.language == 'en'
    //         ? mailMessageForSeller[0]['title']
    //         : mailMessageForSeller[0]['arabicBody'],
    //     text:
    //       buyer.language == 'en'
    //         ? mailMessageForSeller[0]['body']
    //         : mailMessageForSeller[0]['arabicBody'],
    //   });
    // }
  }
}
