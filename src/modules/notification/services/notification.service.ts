/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from '../repositories';
import {
  CreateNotificationMessage,
  CreateNotificationScopeInput,
  NotificationEventDto,
  NotificationInput,
  UpdateAdminNotificationPreferenceScope,
  UpdateAdminNotificationScope,
  UpdateNotificationMessage,
  UpdateNotificationMessageScope,
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
  PushNotificationPayload,
  SendNotificationInput,
} from 'src/common/interface';
import { PushNotificationService } from './push-notification.service';
import {
  NotificationEvent,
  NotificationType,
  ServerSentEvents,
} from 'src/common/enums';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getMessageData } from '../../../common/messages/alert-messages';
import { NotificationScopesEnum } from '../../../common/enums/notification-scope.enum';
import { SuccessResponse } from '../../../common/utils/success.response';
import { AdminNotificationPreferenceRepository } from '../repositories/admin.repository';
import { SseService } from '../../sse/client.service';
import { ConfigService } from '@nestjs/config';
import { MessageEvent } from '../../sse/request/app';
import { NotificationMessagesRepository } from '../repositories/notification-message.repository';
import { NotificationMessages } from '../../../entities/notification-message.entity';
import { In } from 'typeorm';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly frontEndUrl: string;
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly userRepository: UserRepository,
    private readonly notificationScopeRepository: NotificationScopeRepository,
    private readonly mailService: MailgunEmailService,
    private readonly pushNotificationService: PushNotificationService,
    private readonly eventEmitter: EventEmitter2,
    private readonly adminNotificationPreferenceRepository: AdminNotificationPreferenceRepository,
    private readonly configService: ConfigService,
    private readonly notificationScope: NotificationScopeRepository,
    private readonly sseService: SseService,

    private readonly notificationMesageRepository: NotificationMessagesRepository,
  ) {
    this.frontEndUrl = this.configService.get('FRONT_END_URL');
  }

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

  async prepareNotification(notificationInput: SendNotificationInput) {
    try {
      let {
        creatorId,
        receiverId,
        scope,
        recipientFormat,
        event,
        count,
        attachment,
      } = notificationInput;

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
      event = event || scope.name;

      // Define scopes that trigger notifications
      const notificationScopes = Object.values(NotificationScopesEnum);

      // If scope matches one of the predefined notification scopes, send the notification
      const messages = await this.notificationMesageRepository.find({
        where: { scope: scope.scopeGroup, event: event },
      });
      console.log(scope.scopeGroup, event);
      console.log('fkldlfjaldjaf', messages);
      if (notificationScopes.includes(scopeName)) {
        this.SendNotificationBasedOnPreference(
          userPrefBuyer,
          userPrefSeller,
          seller,
          buyer,
          event,
          scope.scopeGroup,
          recipientFormat,
          count,
          attachment,
          messages,
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
    count?: number,
    attachment?: Buffer,
    messages?: NotificationMessages[],
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
          count,
          attachment,
          messages,
        );
      }

      if (userPrefOwner?.email) {
        this.logger.log('Sending notifications');
        this.sendEmailToUser(owner, event, scope, recipientFormat[0], null);
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
          messages,
        );
      }

      if (userPrefOwner?.mobile) {
        this.logger.log('Sending notifications');
        this.sendPushNotificationToUser(
          owner,
          event,
          scope,
          recipientFormat[0],
          messages,
        );
      }

      /*********************
       * Web Notification
       ********************/
      if (userPrefRecipients?.desktop) {
        this.logger.log('Sending notifications');
        this.sendDesktopNotificationToUser(
          recipient,
          event,
          scope,
          recipientFormat[1],

          messages,
        );
      }

      if (userPrefOwner?.desktop) {
        this.logger.log('Sending notifications');
        this.sendDesktopNotificationToUser(
          owner,
          event,
          scope,
          recipientFormat[0],

          messages,
        );
      }
      // Add web notification logic when needed
    } catch (error) {
      this.logger.error('Error sending notifications', error);
      throw new BadRequestException(error);
    }
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
    attachment?: Buffer,
    messages?: NotificationMessages[],
  ): Promise<void> {
    try {
      await this.mailService.sendEmailNotification(user, data, attachment);
    } catch (error) {
      this.logger.log(error);
    }
  }

  async sendPushNotification(data: PushNotificationPayload): Promise<void> {
    try {
      await this.pushNotificationService.sendPushNotification(data);
    } catch (error) {
      this.logger.log(error);
    }
  }

  private sendDesktopNotificationToUser(
    user: User,
    event: string,
    scope: string,
    format: string,
    messages?: NotificationMessages[],
  ) {
    try {
      if (user) {
        const messageData = this.getMessage(
          user.firstName,
          user.arabicFirstName,
          event,
          scope,
          format,
        );
        const subject: string =
          user.language === 'en'
            ? messageData[0]?.title
            : messageData[0]?.arabicTitle;
        const text =
          user.language === 'en'
            ? messageData[0]?.body
            : messageData[0]?.arabicBody;

        const payload: MessageEvent = {
          type: ServerSentEvents.SUCCESS,
          data: {
            subject: subject,
            text: text,
          },
        };

        this.sseService.sendEvent(user.id, payload);
        this.saveNotificationLog({
          title: subject,
          message: text,
          type: NotificationType.SYSTEM_NOTIFICATION,
        });
      }
    } catch (error) {
      this.logger.log(error);
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
    count?: number,
    attachment?: Buffer,
    message?: NotificationMessages[],
  ) {
    try {
      if (user) {
        const messageData = this.getMessage(
          user.firstName,
          user.arabicFirstName,
          event,
          scope,
          format,
          count,
        );

        const subject: string =
          user.language === 'en'
            ? messageData[0]?.title
            : messageData[0]?.arabicTitle;
        const text =
          user.language === 'en'
            ? messageData[0]?.body
            : messageData[0]?.arabicBody;

        //send mail
        this.sendEmailNotification(
          user,
          {
            title: subject,
            message: text,
          },
          attachment,
        );

        this.saveNotificationLog({
          title: subject,
          message: text,
          type: NotificationType.EMAIL_NOTIFICATION,
        });
      }
    } catch (error) {
      this.logger.log(error);
    }
  }

  private sendPushNotificationToUser(
    user: User,
    event: string,
    scope: string,
    format: string,
    messages?: NotificationMessages[],
  ) {
    try {
      const messageData = this.getMessage(
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
        user.language === 'en'
          ? messageData[0].body
          : messageData[0].arabicBody;

      this.sendPushNotification({
        title,
        message,
        deviceType: '',

        notificationToken: user.notificationToken,
        userId: user.id,
        redirectLink: this.frontEndUrl,
      });

      this.saveNotificationLog({
        title: title,
        message: message,
        type: NotificationType.PUSH_NOTIFICATION,
      });
    } catch (error) {
      this.logger.log(error);
    }
  }

  getMessage(
    username: string,
    arabicUsername: string,
    event: string,
    scope: string,
    recipient: string,
    count?: number,
    messages?: Array<NotificationMessages>,
  ) {
    const filteredMessages = messages.filter(
      (message) =>
        message.scope === scope &&
        message.event === event &&
        message.recipients === recipient,
    );

    if (filteredMessages.length === 0) {
      this.logger.log('No matching message found');
    }

    const message = filteredMessages[0]; // Assuming we take the first match

    // Replace placeholders in the desired message's body
    message.body = this.replacePlaceholders(message.body, { username, count });
    message.arabicBody = this.replacePlaceholders(message.arabicBody, {
      username: arabicUsername,
      count,
    });

    return message;
  }

  replacePlaceholders(
    text: string,
    placeholders: { username: string; count?: number },
  ): string {
    if (!text) return '';
    return text.replace(/{{(.*?)}}/g, (_, key: keyof typeof placeholders) => {
      return placeholders[key] !== undefined
        ? String(placeholders[key])
        : `{{${key}}}`;
    });
  }

  /**
   * Helper method to send push notification.
   */
  //Notification  actions

  /**
   * Send Notification Message
   * @async
   * @param {NotificationEventInput} notification
   * @returns {Promise<string>}
   */
  // async handleNotificationEvent(
  //   notification: NotificationEventInput,
  // ): Promise<void> {
  //   try {
  //     const {
  //       recipients,
  //       isEmail,
  //       isPushNotification,
  //       title,
  //       message,
  //       deepLink,
  //     } = notification;
  //     const users = await this.userRepository.find({
  //       where: { id: In([...recipients]) },
  //     });

  //     await Promise.all(
  //       users.map(async (user) => {
  //         const emailData: EmailNotificationPayload = {
  //           title,
  //           message,
  //         };
  //         if (isEmail) {
  //           // Send EMail notification
  //           await this.sendEmailNotification(user, emailData);
  //         }

  //         const pushNotificationData: PushNotificationPayload = {
  //           ...emailData,
  //           notificationToken: user.notificationToken,
  //           redirectLink: deepLink,
  //           userId: user.id,
  //         };

  //         if (isPushNotification) {
  //           // Send EMail notification
  //           await this.sendPushNotification(pushNotificationData);
  //         }

  //         const notificationLog: Partial<Notification> = {
  //           ...emailData,
  //           recipient: user,
  //           type: this.getNotificationType(isEmail, isPushNotification),
  //         };
  //         await this.saveNotificationLog(notificationLog);
  //       }),
  //     );
  //   } catch (error) {
  //     this.logger.error(error);
  //   }
  // }

  // /**
  //  * Get Notification type
  //  *
  //  * @param {boolean} isEmail
  //  * @param {boolean} isPushNotifcation
  //  * @returns {NotificationType}
  //  */
  // getNotificationType(
  //   isEmail: boolean,
  //   isPushNotifcation: boolean,
  // ): NotificationType {
  //   let notificationType: NotificationType;

  //   if (isEmail && isPushNotifcation) {
  //     notificationType = NotificationType.ALL;
  //   } else if (isEmail) {
  //     notificationType = NotificationType.EMAIL_NOTIFICATION;
  //   } else if (isPushNotifcation) {
  //     notificationType = NotificationType.PUSH_NOTIFICATION;
  //   } else {
  //     notificationType = NotificationType.SYSTEM_NOTIFICATION;
  //   }
  //   return notificationType;
  // }

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

  async updateNotificationScope(
    input: UpdateAdminNotificationScope,
  ): Promise<SuccessResponse> {
    try {
      const { id, ...rest } = input;
      const notificationScope = await this.notificationScopeRepository.findOne({
        where: { id },
      });
      const { affected } = await this.notificationScopeRepository.update(
        notificationScope.id,
        rest,
      );

      if (affected > 0) {
        const notificationScope =
          await this.notificationScopeRepository.findOne({
            where: { id },
          });
        return new SuccessResponse(AppStrings.SUCCESSFULL, notificationScope);
      }
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async updateAdminNotificationScopePreference(
    input: UpdateAdminNotificationPreferenceScope,
  ): Promise<SuccessResponse> {
    try {
      const { id, ...rest } = input;
      const notificationScope =
        await this.adminNotificationPreferenceRepository.findOne({
          where: { id },
        });
      const { affected } =
        await this.adminNotificationPreferenceRepository.update(
          notificationScope.id,
          rest,
        );

      if (affected > 0) {
        const notificationScope =
          await this.adminNotificationPreferenceRepository.findOne({
            where: { id },
          });
        return new SuccessResponse(AppStrings.SUCCESSFULL, notificationScope);
      }
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async findNotificationControl() {
    try {
      const notificationControl =
        await this.notificationMesageRepository.find();
      return notificationControl;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async findOneNotificationControl(id: string) {
    try {
      const notificationControl =
        await this.notificationMesageRepository.findOneBy({ id });
      return notificationControl;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async fetchNotificationScopes() {
    try {
      const admin = await this.userRepository.findOne({
        where: { userType: 'admin' },
      });
      const data = await this.adminNotificationPreferenceRepository.find();
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async createAdminNotificationScopePreference(
    input: CreateNotificationScopeInput,
  ): Promise<NotificationScope> {
    try {
      const notificationScope = await this.notificationScope.save(input);

      if (notificationScope) {
        await this.adminNotificationPreferenceRepository.save({
          email: true,
          desktop: true,
          mobile: true,
          scope: notificationScope,
        });
      }

      return notificationScope;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async addNotificationMessage(
    createNotificationMessage: CreateNotificationMessage,
  ) {
    try {
      const data = await this.notificationMesageRepository.save(
        createNotificationMessage,
      );

      return new SuccessResponse(AppStrings.SUCCESSFULL, data);
    } catch (error) {
      this.logger.error(error);

      throw new BadRequestException(error);
    }
  }

  async updateNotificationMessage(
    updateNotificationMessage: UpdateNotificationMessage,
  ) {
    try {
      const { id, ...rest } = updateNotificationMessage;
      const data = await this.notificationMesageRepository.update(id, rest);

      return new SuccessResponse(AppStrings.SUCCESSFULL, data);
    } catch (error) {
      this.logger.error(error);

      throw new BadRequestException(error);
    }
  }

  async updateNotificationMessageScope(
    updateNotificationMessage: UpdateNotificationMessageScope,
  ) {
    try {
      // Step 1: Create a lookup for the system feature settings by id
      const settingsMap = new Map(
        updateNotificationMessage.notificationMessageScope.map((feature) => [
          feature.id,
          feature,
        ]),
      );

      // Step 2: Retrieve the features from the database
      const notificationMessage = await this.notificationMesageRepository.find({
        where: {
          id: In(
            updateNotificationMessage.notificationMessageScope.map(
              (feature) => feature.id,
            ),
          ),
        },
      });

      // Step 3: Prepare the features to be updated
      const settingToUpdate = notificationMessage.map((feature) => {
        const featureData = settingsMap.get(feature.id);
        if (featureData) {
          // If setting data exists for this feature, update it
          return {
            ...feature,
            email: featureData.email ?? feature.email,
            pushNotification:
              featureData.pushNotification ?? feature.pushNotification,
            systemNotification:
              featureData.systemNotification ?? feature.systemNotification,
          };
        }
        return feature; // No update if no setting data found
      });

      // Step 4: Save the updated features to the repository
      const updated =
        await this.notificationMesageRepository.save(settingToUpdate);

      return new SuccessResponse(AppStrings.SUCCESSFULL, updated);

      // const notificationMessage = await this.notificationMesageRepository.find({
      //   // where: { id: In },
      // });
    } catch (error) {
      this.logger.error(error);

      throw new BadRequestException(error);
    }
  }
}
