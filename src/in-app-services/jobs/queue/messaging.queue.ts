import { InjectQueue } from '@nestjs/bullmq';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { NotificationMessages } from '../../../entities/notification-message.entity';
import { User } from '../../../entities';
import { NotificationService } from '../../../modules/notification/services';
import { SendNotificationEventInput } from '../../../modules/notification/dtos';
import { JobEnum } from '../../../common/enums/jobs';
import { Messages } from '../../../entities/message.entity';

@Injectable()
export class NotificationQueue {
  constructor(
    @InjectQueue('notification') private readonly notificationQueue: Queue,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}

  logger = new Logger();
  async sendEmailNotification(payload: SendNotificationEventInput) {
    try {
      if (payload.user) {
        const messageData = this.notificationService.getMessage(
          payload.user.firstName,
          payload.user.arabicFirstName,
          payload.event,
          payload.scope,
          payload.format,
          payload.count,
          payload.messages,
        );
        if (messageData) {
          const subject: string =
            payload.user.language === 'en'
              ? messageData?.title
              : messageData?.arabicTitle;
          const text =
            payload.user.language === 'en'
              ? messageData?.body
              : messageData?.arabicBody;

          this.notificationQueue.add(JobEnum.EMAIL_NOTIFICATION, {
            user: payload.user,
            data: {
              title: subject,
              message: text,
            },
            attachment: payload.metadata,
          });
        }
      }
    } catch (error) {
      this.logger.log(error);
    }
  }

  async sendPushNotificationToUser(payload: SendNotificationEventInput) {
    try {
      const messageData = this.notificationService.getMessage(
        payload.user.firstName,
        payload.user.arabicFirstName,
        payload.event,
        payload.scope,
        payload.format,
        payload.count,
        payload.messages,
      );

      if (messageData) {
        const title =
          payload.user.language === 'en'
            ? messageData?.title
            : messageData?.arabicTitle;
        const message =
          payload.user.language === 'en'
            ? messageData?.body
            : messageData?.arabicBody;

        this.notificationQueue.add(JobEnum.PUSH_NOTIFICATION, {
          title,
          message,
          deviceType: '',
          img: payload?.img,
          notificationToken: payload.notificationToken,
          userId: payload.user.id,
          redirectLink: '',
        });
      }
    } catch (error) {
      this.logger.log(error);
    }
  }

  async sendDesktopNotificationToUser(payload: SendNotificationEventInput) {
    try {
      console.log('payload', payload);
      if (payload.user) {
        const messageData = this.notificationService.getMessage(
          payload.user.firstName,
          payload.user.arabicFirstName,
          payload.event,
          payload.scope,
          payload.format,
          payload.count,
          payload.messages,
        );
        if (messageData) {
          // const subject: string =
          //   payload.user.language === 'en'
          //     ? messageData?.title
          //     : messageData?.arabicTitle;
          // const text =
          //   payload.user.language === 'en'
          //     ? messageData?.body
          //     : messageData?.arabicBody;
          this.notificationQueue.add(JobEnum.SYSTEM_NOTIFICATION, {
            title: messageData.title,
            arabicTitle: messageData?.arabicTitle,
            category: messageData.scope,
            subCategory: messageData.event,
            scope: payload.scope,
            metadata: payload.metadata,
            recipient: payload.user,
            message: messageData,
            arabicMessage: messageData?.arabicBody,
            img: payload.img,
            sse: payload.sse,
          });
        }
      }
    } catch (error) {
      this.logger.log(error);
    }
  }
}
