import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { Auction } from '../../../entities/auction-table.entity';
import { JobEnum } from '../../../common/enums/jobs';
import { subMinutes } from 'date-fns';
import { AuctionRepository } from '../../../modules/listing/repositories/auction.repository';
import { BidRegistrationRepository } from '../../../modules/listing/repositories/bid-registration.repository';

@Injectable()
export class AuctionQueue {
  constructor(
    @InjectQueue('auction')
    private auctionQueue: Queue,
    private readonly auctionRepository: AuctionRepository,
    private readonly bidRegistrationRepository: BidRegistrationRepository,
  ) {}
  logger = new Logger();

  async auctionEndInOneMinute(auction: Auction, data: any) {
    try {
      const notifyTime = subMinutes(auction.expireAt, 1);
      const delay = this.getDelay(notifyTime);

      await this.auctionQueue.add(
        JobEnum.AUCTION_NOTIFICATION_ABOUT_TO_END,
        { id: data.id },
        {
          delay: delay,
        },
      );
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }

  async liveAuction(data) {
    try {
      await this.auctionQueue.add(JobEnum.NEW_BID, {
        id: data.id,
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async auctionEnd(data) {
    try {
      const auction = await this.auctionRepository.findOne({
        where: { id: data.id },
      });
      const notifyTime = auction.expireAt;
      const lastMinute = subMinutes(auction.expireAt, 1);
      const aboutToEnd = subMinutes(auction.expireAt, 15);
      const delay = this.getDelay(notifyTime);

      await this.auctionQueue.add(
        JobEnum.AUCTION_WINNER,
        {
          id: data.id,
        },
        {
          delay: delay,
        },
      );

      await this.auctionQueue.add(
        JobEnum.NO_BID,
        {
          id: data.id,
        },
        {
          delay: delay,
        },
      );

      await this.auctionQueue.add(
        JobEnum.AUCTION_LOOSER,
        {
          id: data.id,
        },
        {
          delay: delay,
        },
      );
      await this.auctionQueue.add(
        JobEnum.LAST_MINUTES,
        {
          id: data.id,
          listingId: data.listingId,
        },
        {
          delay: this.getDelay(lastMinute),
        },
      );
      await this.auctionQueue.add(
        JobEnum.AUCTION_NOTIFICATION_ABOUT_TO_END,
        {
          id: data.id,
          listingId: data.listingId,
        },
        {
          delay: this.getDelay(aboutToEnd),
        },
      );
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }

  async deleteJobsByDataId(targetIds: string[]) {
    const jobs = await this.auctionQueue.getJobs([
      'delayed', // Jobs that are scheduled for later
    ]);
    for (const job of jobs) {
      if (targetIds.includes(job.data.id)) {
        await job.remove();
      }
    }
  }

  private readonly getDelay = (targetDate: Date): number => {
    const now = new Date().getTime();
    const targetTime = new Date(targetDate).getTime();
    const delay = targetTime - now;
    return delay > 0 ? delay : 0; // Ensure delay is non-negative
  };
}
