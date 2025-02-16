/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  OnModuleInit,
  UnprocessableEntityException,
} from '@nestjs/common';
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
  UserNotificationRepository,
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
import { NotificationScopeEnum } from '../../../common/enums/notification-scope.enum';
import { SuccessResponse } from '../../../common/utils/success.response';
import { AdminNotificationPreferenceRepository } from '../repositories/admin.repository';
import { SseService } from '../../sse/client.service';
import { ConfigService } from '@nestjs/config';
import { MessageEvent } from '../../sse/request/app';
import { NotificationMessagesRepository } from '../repositories/notification-message.repository';
import { NotificationMessages } from '../../../entities/notification-message.entity';
import { In } from 'typeorm';
import { StorageService } from '../../file-handler/services/storage.service';
import { NotificationTokenRepository } from '../repositories/notification-token.repository';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';
import { NotificationResponse } from '../dtos/response/notification';

@Injectable()
export class NotificationService implements OnModuleInit {
  static isEventTriggered = false;
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
    private readonly notificationTokenRepository: NotificationTokenRepository,

    private readonly userNotificationPreference: UserNotificationRepository,
    private readonly storageService: StorageService,
  ) {
    this.frontEndUrl = this.configService.get('FRONT_END_URL');
  }

  onModuleInit() {
    this.eventEmitter.on('customEvent', () => {
      NotificationService.isEventTriggered = true;
    });
  }

  static getEventTriggered(): boolean {
    return this.isEventTriggered;
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
      const {
        creatorId,
        receiverId,
        scope,
        recipientFormat,
        event = scope.name,
        count,
        attachment,
        metadata,
        img,
      } = notificationInput;

      const specificEvent = notificationInput.event ?? event;

      // Fetch buyer and seller notification preferences for the given scope

      const [sellerPref, buyerPref] = await Promise.all([
        this.userNotificationPreference.findOne({
          where: { user: { id: creatorId }, scope: { id: scope.id } },
          relations: ['user', 'scope'],
        }),

        this.userNotificationPreference.findOne({
          where: { user: { id: receiverId }, scope: { id: scope.id } },
          relations: ['user', 'scope'],
        }),
      ]);

      //If neither buyer nor seller has preferences for this scope, skip
      if (!sellerPref && !buyerPref) {
        this.logger.warn(
          `No notification preferences found for scope: ${scope.id}`,
        );
        return;
      }

      // Define scopes triggering notifications
      const notificationScopes = new Set(Object.values(NotificationScopeEnum));

      // Check if scope matches predefined notification scopes
      const scopeName = scope.scopeGroup as NotificationScopeEnum;

      if (notificationScopes.has(scopeName)) {
        // Fetch messages relevant tBodyo the scope and event
        const messages = await this.notificationMesageRepository.find({
          where: {
            scope: scope.scopeGroup,
            event: specificEvent,
          },
        });

        // Process notifications based on preferences
        await this.SendNotificationBasedOnPreference(
          buyerPref,
          sellerPref,
          sellerPref?.user,
          buyerPref?.user,
          specificEvent,
          scope.scopeGroup,
          recipientFormat,
          count,
          attachment,
          messages,
          metadata,
          img,
        );
      }
    } catch (error) {
      this.logger.debug('Error sending notification:', error);
      throw error; // Re-throw for caller to handle
    }
  }

  //TODO: use Event emmiter
  async SendNotificationBasedOnPreference(
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
    metadata?: string,
    img?: string,
  ) {
    try {
      /************************
       * Email Notification
       ************************/

      if (userPrefRecipients?.email) {
        this.logger.log('Sending  email notifications');
        this.sendEmailToUser(
          recipient,
          event,
          scope,
          recipientFormat[1],
          count,
          attachment,
          messages,
          metadata,
          img,
        );
      }

      if (userPrefOwner?.email) {
        this.logger.log('Sending  email notifications');
        this.sendEmailToUser(
          owner,
          event,
          scope,
          recipientFormat[0],
          count,
          null,
          messages,
          metadata,
          img,
        );
      }

      /************************
       * Push Notification
       ************************/
      if (userPrefRecipients?.mobile) {
        this.logger.log('Sending  push notifications');
        const recipientNotificationToken =
          await this.notificationTokenRepository.findOne({
            where: { userId: recipient?.id },
          });

        if (recipientNotificationToken) {
          this.sendPushNotificationToUser(
            recipient,
            recipientNotificationToken.token,
            event,
            scope,
            recipientFormat[1],
            count,
            messages,
            metadata,
            img,
          );
        }
      }

      if (userPrefOwner?.mobile) {
        this.logger.log('Sending push notifications');
        const ownerNotificationToken =
          await this.notificationTokenRepository.findOne({
            where: { userId: owner?.id },
          });

        if (ownerNotificationToken) {
          this.sendPushNotificationToUser(
            owner,
            ownerNotificationToken?.token,
            event,
            scope,
            recipientFormat[0],
            count,
            messages,
            metadata,
            img,
          );
        }
      }

      /*********************
       * Web Notification
       ********************/
      if (userPrefRecipients?.desktop) {
        this.logger.log('Sending  system notifications');
        this.sendDesktopNotificationToUser(
          recipient,
          event,
          scope,
          recipientFormat[1],
          count,
          messages,
          metadata,
          img,
          true,
        );
      }
      if (userPrefRecipients?.desktop == false) {
        this.logger.log('Sending  system notifications');
        this.sendDesktopNotificationToUser(
          recipient,
          event,
          scope,
          recipientFormat[1],
          count,
          messages,
          metadata,
          img,
          false,
        );
      }

      if (userPrefOwner?.desktop) {
        this.logger.log('Sending system notifications');
        this.sendDesktopNotificationToUser(
          owner,
          event,
          scope,
          recipientFormat[0],
          count,
          messages,
          metadata,
          img,
          true,
        );
      }
      if (userPrefOwner?.desktop == false) {
        this.logger.log('Sending system notifications');
        this.sendDesktopNotificationToUser(
          owner,
          event,
          scope,
          recipientFormat[0],
          count,
          messages,
          metadata,
          img,
          false,
        );
      }
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
  async sendPushNotification(data: PushNotificationPayload): Promise<void> {
    try {
      await this.pushNotificationService.sendPushNotification(data);
    } catch (error) {
      this.logger.log(error);
    }
  }
  private async sendDesktopNotificationToUser(
    user: User,
    event: string,
    scope: string,
    format: string,
    count: number,
    messages?: NotificationMessages[],
    metadata?: string,
    img?: string,
    sse?: boolean,
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
          messages,
        );

        if (messageData) {
          const subject: string =
            user.language === 'en'
              ? messageData?.title
              : messageData?.arabicTitle;
          const text =
            user.language === 'en'
              ? messageData?.body
              : messageData?.arabicBody;

          const payload: MessageEvent = {
            type: ServerSentEvents.SUCCESS,
            data: {
              subject: subject,
              text: text,
            },
          };
          if (sse) {
            this.sseService.sendEvent(user.id, payload);
          }

          await this.saveNotificationLog({
            title: subject,
            category: messageData.scope,
            subCategory: messageData.event,
            metadata: metadata,

            recipient: user,
            message: text,
            type: NotificationType.SYSTEM_NOTIFICATION,
            img,
          });
        }
      }
    } catch (error) {
      this.logger.log(error);
    }
  }

  /**
   * Helper method to send email notification.
   */
  private async sendEmailToUser(
    user: User,
    event: string,
    scope: string,
    format: string,
    count?: number,
    attachment?: Buffer,
    message?: NotificationMessages[],
    metadata?: string,
    img?: string,
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
          message,
        );
        if (messageData) {
          const subject: string =
            user.language === 'en'
              ? messageData?.title
              : messageData?.arabicTitle;
          const text =
            user.language === 'en'
              ? messageData?.body
              : messageData?.arabicBody;

          //Send mail
          this.sendEmailNotification(
            user,
            {
              title: subject,
              message: text,
            },
            attachment,
          );
        }
      }
    } catch (error) {
      this.logger.log(error);
    }
  }

  private async sendPushNotificationToUser(
    user: User,
    notificationToken: string,
    event: string,
    scope: string,
    format: string,
    count: number,
    messages?: NotificationMessages[],
    metadata?: string,
    img?: string,
  ) {
    try {
      const messageData = this.getMessage(
        user.firstName,
        user.arabicFirstName,
        event,
        scope,
        format,
        count,
        messages,
      );

      if (messageData) {
        const title =
          user.language === 'en'
            ? messageData?.title
            : messageData?.arabicTitle;
        const message =
          user.language === 'en' ? messageData?.body : messageData?.arabicBody;

        await this.sendPushNotification({
          title,
          message,
          deviceType: '',
          img,

          notificationToken: notificationToken,
          userId: user.id,
          redirectLink: this.frontEndUrl,
        });
      }
    } catch (error) {
      this.logger.log(error);
    }
  }

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

  getMessage(
    username: string,
    arabicUsername: string,
    event: string,
    scope: string,
    recipient: string,
    count?: number,
    messages?: NotificationMessages[],
  ) {
    if (!messages || messages.length === 0) {
      this.logger.log('Messages array is empty or undefined');
      return null;
    }

    const filteredMessages = messages.filter(
      (message) =>
        message.scope == scope &&
        message.event == event &&
        message?.recipients == recipient,
    );

    if (filteredMessages.length < 1) {
      this.logger.log('No matching message found');
      return null; // Early return to avoid accessing undefined
    }

    const message = filteredMessages[0]; // Take the first matching message

    // Replace placeholders in the desired message's body
    message.body = this.replacePlaceholders(message?.body, { username, count });
    message.arabicBody = this.replacePlaceholders(message?.arabicBody, {
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
    const result = await this.notificationRepository.save(data);
    return result;
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
  async markAllAsRead(user: User): Promise<SuccessResponse> {
    try {
      const { affected } = await this.notificationRepository
        .createQueryBuilder()

        .update(Notification)
        .set({ read: true })
        .where('user.id= :id', { id: user.id })
        .execute();

      if (affected) {
        return new SuccessResponse();
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
  /**
   * List user's Notification
   *
   * @async
   * @param {User} user
   * @returns {Promise<Notification[]>}
   */
  async find(
    paginateAndSort: PaginateAndSort,
    user: User,
  ): Promise<NotificationResponse> {
    const [[notification, total], unread] = await Promise.all([
      this.notificationRepository.findAndCount({
        where: { recipient: { id: user.id } },
        take: paginateAndSort.take ?? 20,
        skip: paginateAndSort.skip ?? 0,
      }),
      this.notificationRepository
        .createQueryBuilder('notification')
        .where(
          'notification.read IS false AND notification.recipientId = :userId',
          {
            userId: user.id,
          },
        )
        .getCount(),
    ]);

    return { notification, unread, total };
  }
  async deleteNotification(user: User) {
    try {
      // Perform a soft delete of notifications for the given user
      const result = await this.notificationRepository.softDelete({
        recipient: { id: user.id },
      });

      // Return the result of the delete operation
      return new SuccessResponse(AppStrings.SUCCESSFULL);
    } catch (error) {
      this.logger.error('Error deleting notifications', error.stack);
      throw new BadRequestException('Failed to delete notifications');
    }
  }

  async deleteOneNotification(id: string) {
    try {
      // Perform a soft delete of notifications for the given user
      const result = await this.notificationRepository.softDelete({ id });

      // Return the result of the delete operation
      return new SuccessResponse(AppStrings.SUCCESSFULL);
    } catch (error) {
      this.logger.error('Error deleting notifications', error.stack);
      throw new BadRequestException('Failed to delete notifications');
    }
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

  async listNotificationScopesForUser(
    user: User,
  ): Promise<UserNotificationPreference[]> {
    return this.userNotificationPreference.findAll({
      where: {
        user: { id: user.id },
      },
    });
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

  async uploadImage(id: string, file: Express.Multer.File[]) {
    try {
      const notificationControl =
        await this.notificationMesageRepository.findOneByOrFail({
          id,
        });

      if (!notificationControl) {
        throw new BadRequestException(AppStrings.NOT_FOUND);
      }
      const url = await this.storageService.upload(file[0]);

      const { affected } = await this.notificationMesageRepository.update(
        notificationControl.id,
        {
          icon: url,
        },
      );

      if (affected > 0) {
        return await this.notificationMesageRepository.findOneByOrFail({ id });
      }
    } catch (error) {
      this.logger.log(error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new UnprocessableEntityException(error);
      }
    }
  }

  async updateNotificationMessageScope(
    updateNotificationMessage: UpdateNotificationMessageScope,
  ) {
    try {
      // Extract the notification scopes from the input
      const { notificationMessageScope } = updateNotificationMessage;

      // Create a map for quick lookups by feature ID
      const settingsMap = new Map(
        notificationMessageScope.map((feature) => [feature.id, feature]),
      );

      // Fetch relevant features from the database
      const featureIds = Array.from(settingsMap.keys());
      const existingFeatures = await this.notificationMesageRepository.findBy({
        id: In(featureIds),
      });

      // Prepare updated features
      const featuresToUpdate = existingFeatures.map((feature) => {
        const updateData = settingsMap.get(feature.id);

        // Update only the fields that are provided in the input
        return {
          ...feature,
          email: updateData?.email ?? feature.email,
          pushNotification:
            updateData?.pushNotification ?? feature.pushNotification,
          systemNotification:
            updateData?.systemNotification ?? feature.systemNotification,
        };
      });

      // Save updated features
      const updatedFeatures =
        await this.notificationMesageRepository.save(featuresToUpdate);

      // Return success response
      return new SuccessResponse(AppStrings.SUCCESSFULL, updatedFeatures);
    } catch (error) {
      this.logger.error(
        'Error updating notification message scope',
        error.stack,
      );

      // Handle unexpected errors gracefully
      throw new BadRequestException('Failed to update notification messages');
    }
  }
}
