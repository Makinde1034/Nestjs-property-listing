import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AuctionRepository } from '../../../modules/listing/repositories/auction.repository';
import { JobEnum } from '../../../common/enums/jobs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEvent } from '../../../common/enums';
import { BidRegistrationRepository } from '../../../modules/listing/repositories/bid-registration.repository';
import { AuctionParticipantRepository } from '../../../modules/listing/repositories/auction-participant.repository';
import { BidsRepository } from '../../../modules/listing/repositories/bids.repository';
import { ListingRepository } from '../../../modules/listing/repositories/listing.repository';
import { NotificationScopeRepository } from '../../../modules/user/repositories';
import { NotificationScope } from '../../../entities';
import { NotificationScopeEnum } from '../../../common/enums/notification-scope.enum';
import { NotificationService } from '../../../modules/notification/services';
import {
  PushNotificationinput,
  PushNotificationPayload,
} from '../../../common/interface';
import { time } from 'console';

@Processor('notification')
export class NotificationProcessor extends WorkerHost {
  constructor(
    private readonly auctionRepository: AuctionRepository,
    private readonly bidRegistrationRepository: BidRegistrationRepository,
    private readonly auctionParticipantRepository: AuctionParticipantRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly bidRepository: BidsRepository,
    private readonly listingRepository: ListingRepository,
    private readonly notificationScopeRepository: NotificationScopeRepository,
    private readonly notificationService: NotificationService,
  ) {
    super();
  }
  async process(job: Job) {
    try {
      console.log(job.name);
      let data;

      switch (job.name) {
        case JobEnum.EMAIL_NOTIFICATION:
          console.log('processing job', job.name);

          await this.notificationService.sendEmailNotification(
            job.data.user,
            job.data.data,
            job.data.attachment,
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
      console.log(error);
      throw error;
    }
  }
}
