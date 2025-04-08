import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { JobEnum } from '../../../common/enums/jobs';

import { NotificationService } from '../../../modules/notification/services';

import { BadRequestException } from '@nestjs/common';

@Processor('notification')
export class NotificationProcessor extends WorkerHost {
  constructor(private readonly notificationService: NotificationService) {
    super();
  }
  async process(job: Job) {
    try {
      let data;

      switch (job.name) {
        case JobEnum.EMAIL_NOTIFICATION:
          await this.notificationService.sendEmailNotification(
            job.data.user,
            job.data.data,
            job.data.attachment,
            job.data.metadata,
          );
          break;

        case JobEnum.PUSH_NOTIFICATION:
          data = {
            title: job.data?.title,
            message: job.data?.message,
            deviceType: job.data?.deviceType,
            notificationToken: job.data?.notificationToken,
            redirectLink: job.data?.redirectLink,
            userId: job.data?.userId,
            img: job.data?.image,
          };

          await this.notificationService.sendPushNotification(data);
          break;

        case JobEnum.SYSTEM_NOTIFICATION:
          data = {
            user: job.data.recipient,
            event: job.data.subCategory,
            scope: job.data.category,
            // format: job.data.format,
            count: job.data.count,
            message: job.data.message,
            metadata: job.data.metadata,
            img: job.data.img,
            sse: job.data.sse,
          };
          await this.notificationService.sendSystemNotification(data);

          break;

        default:
          break;
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
