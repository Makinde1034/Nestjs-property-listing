/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { BadRequestException, Injectable, Logger, Scope } from '@nestjs/common';
import { NotificationRepository } from '../repositories';
import {
  NotificationEventDto,
  NotificationInput,
  SendNotificationInput,
} from '../dtos';
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
    private notificationRepository: NotificationRepository,
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
      console.log(notificationInput);
      //Get user information for buyer and their notification preference
      const buyer = await this.userRepository.findOneOrFail({
        where: { id: notificationInput.creatorId },
        relations: ['notificationPreference'],
      });

      //Get user information for seller and their notification preference

      const seller = await this.userRepository.findOneOrFail({
        where: { id: notificationInput.receiverId },
        relations: ['notificationPreference'],
      });

      //Get the preference of a particular user
      const userPrefBuyer = buyer.notificationPreference.find((element) => {
        if (element.scope.id == notificationInput.scope.id) {
          return element;
        }
      });

      //Get the preference of a particular user
      const userPrefSeller = seller.notificationPreference.find((element) => {
        if (element.scope.id == notificationInput.scope.id) {
          return element;
        }
      });

      //Generate notification payload based on scope
      switch (notificationInput.scope.name) {
        case NotificationScopesEnum.CREATE_OFFER:
          this.SendNotificationBasedOnPreference(
            userPrefBuyer,
            userPrefSeller,
            seller,
            buyer,
            notificationInput.event,
            notificationInput.scope.scopeGroup,
            notificationInput.recipientFormat,
          );
          break;

        case NotificationScopesEnum.UPDATE_OFFER:
          this.SendNotificationBasedOnPreference(
            userPrefBuyer,
            userPrefSeller,
            seller,
            buyer,
            notificationInput.event,
            notificationInput.scope.scopeGroup,
            notificationInput.recipientFormat,
          );
          break;

        case NotificationScopesEnum.ACCEPTED:
          this.SendNotificationBasedOnPreference(
            userPrefBuyer,
            userPrefSeller,
            seller,
            buyer,
            notificationInput.event,
            notificationInput.scope.scopeGroup,
            notificationInput.recipientFormat,
          );
          break;

        case NotificationScopesEnum.RESPONSE:
          this.SendNotificationBasedOnPreference(
            userPrefBuyer,
            userPrefSeller,
            seller,
            buyer,
            notificationInput.event,
            notificationInput.scope.scopeGroup,
            notificationInput.recipientFormat,
          );
          break;

        default:
          break;
      }
    } catch (error) {
      console.log(error);
      this.logger.log(error);
    }
  }
  //TODO: use Event emmiter
  SendNotificationBasedOnPreference(
    userPrefRecipients: UserNotificationPreference,
    userPrefOwner: UserNotificationPreference,
    owner: User,
    recipient: User,
    event: string,
    scope: string,
    recipientFormat?: [string, string],
  ) {
    try {
      /************************
       * Email notification
       ************************/
      this.logger.log('Sending mail');
      console.log(recipientFormat);

      if (userPrefRecipients?.email) {
        const mailMessageForBuyer = getMessageData(
          recipient.firstName,
          recipient.arabicFirstName,
          event,
          scope,
          recipientFormat[1],
        );

        this.sendEmailNotification(null, null, 'offer', {
          email: recipient.email,
          subject:
            recipient.language == 'en'
              ? mailMessageForBuyer[0]?.title
              : mailMessageForBuyer[0]?.arabicTitle,
          text:
            recipient.language == 'en'
              ? mailMessageForBuyer[0]?.body
              : mailMessageForBuyer[0]?.arabicBody,
        });
        this.mailService.sendOfferMail({
          email: recipient.email,
          subject:
            recipient.language == 'en'
              ? mailMessageForBuyer[0]?.title
              : mailMessageForBuyer[0]?.arabicTitle,
          text:
            recipient.language == 'en'
              ? mailMessageForBuyer[0]?.body
              : mailMessageForBuyer[0]?.arabicBody,
        });
      }

      if (userPrefOwner?.email) {
        const mailMessageForSeller = getMessageData(
          recipient.firstName,
          recipient.arabicFirstName,
          event,
          scope,
          recipientFormat[0],
        );

        this.sendEmailNotification(null, null, 'offer', {
          email: owner.email,
          subject:
            recipient.language == 'en'
              ? mailMessageForSeller[0]?.title
              : mailMessageForSeller[0]?.arabicBody,
          text:
            recipient.language == 'en'
              ? mailMessageForSeller[0]?.body
              : mailMessageForSeller[0]?.arabicBody,
        });
      }

      /************************
       * Push notification
       ************************/

      if (userPrefRecipients?.mobile) {
        const mailMessageForBuyer = getMessageData(
          recipient.firstName,
          recipient.arabicFirstName,
          event,
          scope,
          recipientFormat[1],
        );
        this.sendUsersNotification({
          recipients: [recipient.id],
          isPushNotification: true,
          isEmail: false,
          title:
            recipient.language == 'en'
              ? mailMessageForBuyer[0].title
              : mailMessageForBuyer[0].arabicTitle,
          message:
            recipient.language == 'en'
              ? mailMessageForBuyer[0].body
              : mailMessageForBuyer[0].arabicBody,
        });
      }

      if (userPrefOwner?.email) {
        const mailMessageForSeller = getMessageData(
          recipient.firstName,
          recipient.arabicFirstName,
          event,
          scope,
          recipientFormat[1],
        );

        this.sendUsersNotification({
          recipients: [owner.id],
          isPushNotification: true,
          isEmail: false,
          title:
            recipient.language == 'en'
              ? mailMessageForSeller[0].title
              : mailMessageForSeller[0].arabicBody,
          message:
            recipient.language == 'en'
              ? mailMessageForSeller[0].body
              : mailMessageForSeller[0].arabicBody,
        });
      }

      /************************
       * Web notification
       ************************/

      // If (userPrefRecipients?.desktop) {
      //   Const mailMessageForBuyer = getMessageData(
      //     Buyer.firstName,
      //     'Create',
      //     'Offers',
      //     'Offer Creator',
      //   );
      //   This.mailService.sendOfferMail({
      //     Email: buyer.email,
      //     Subject:
      //       Buyer.language == 'en'
      //         ? mailMessageForBuyer[0]['title']
      //         : mailMessageForBuyer[0]['arabicTitle'],
      //     Text:
      //       Buyer.language == 'en'
      //         ? mailMessageForBuyer[0]['body']
      //         : mailMessageForBuyer[0]['arabicBody'],
      //   });
      // }

      // If (userPrefOwner?.desktop) {
      //   Const mailMessageForSeller = getMessageData(
      //     Seller.arabicFirstName,
      //     'Create',
      //     'Offers',
      //     'Seller',
      //   );

      //   This.mailService.sendOfferMail({
      //     Email: buyer.email,
      //     Subject:
      //       Buyer.language == 'en'
      //         ? mailMessageForSeller[0]['title']
      //         : mailMessageForSeller[0]['arabicBody'],
      //     Text:
      //       Buyer.language == 'en'
      //         ? mailMessageForSeller[0]['body']
      //         : mailMessageForSeller[0]['arabicBody'],
      //   });
      // }
    } catch (error) {
      console.log(error);
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }
}
