import { InjectQueue } from '@nestjs/bullmq';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { Auction } from '../../../entities/auction-table.entity';
import { JobEnum } from '../../../common/enums/jobs';
import { subMinutes, subSeconds } from 'date-fns';
import { AuctionRepository } from '../../../modules/listing/repositories/auction.repository';
import { BidRegistrationRepository } from '../../../modules/listing/repositories/bid-registration.repository';

@Injectable()
export class AuctionQueue {
  constructor(
    @InjectQueue('auction')
    private readonly auctionQueue: Queue,
    private readonly auctionRepository: AuctionRepository,
    private readonly bidRegistrationRepository: BidRegistrationRepository,
  ) {}
  logger = new Logger();

  async auctionStart(auction: Auction, data: any) {
    try {
      const notifyTime = subMinutes(auction.startDate, 720);

      const delay = this.getDelay(notifyTime);

      await this.auctionQueue.add(
        JobEnum.AUCTION_START,
        {
          id: data.id,
        },
        {
          delay: delay,
        },
      );
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }

  async auctionEndInOneMinute(auction: Auction, data: any, existing?: any) {
    try {
      let increment;

      if (existing == 0) {
        increment = 1;
      } else if (existing > 0) {
        increment = existing;
      }
      const notifyTime = subMinutes(auction.expireAt, 5 * increment);
      const delay = this.getDelay(notifyTime);

      await this.auctionQueue.add(
        JobEnum.LAST_MINUTES,
        { id: data.id },
        {
          delay: delay,
        },
      );
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }

  async auctionEndInHalfHour(auction: Auction, data: any, existing?: any) {
    try {
      let increment;

      if (existing == 0) {
        increment = 1;
      } else if (existing > 0) {
        increment = existing;
      }
      const aboutToEnd = subMinutes(auction.expireAt, 5 * increment);
      const delay = this.getDelay(aboutToEnd);

      await this.auctionQueue.add(
        JobEnum.AUCTION_NOTIFICATION_ABOUT_TO_END,
        {
          id: data.id,
          listingId: data.listingId,
        },
        {
          delay: delay,
        },
      );
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async liveAuction(data) {
    try {
      await this.auctionQueue.add(JobEnum.NEW_BID, {
        id: data.id,
        listingId: data.listingId,
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async bid(data) {
    try {
      const currentDate = new Date();

      const time = subSeconds(currentDate, 3);
      const delay = this.getDelay(time);

      await this.auctionQueue.add(
        JobEnum.AUTO_BID,
        {
          id: data.id,
          auctionId: data.auctionId,
          listingId: data.listingId,
          userId: data.userId,
          price: data.price,
          reference: data.reference,
        },
        {
          delay: delay,
        },
      );
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }

  async auctionEnd(data) {
    try {
      const auction = await this.auctionRepository.findOne({
        where: { id: data.id },
      });
      const notifyTime = auction.expireAt;

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
      // await this.auctionQueue.add(
      //   JobEnum.LAST_MINUTES,
      //   {
      //     id: data.id,
      //     listingId: data.listingId,
      //   },
      //   {
      //     delay: this.getDelay(lastMinute),
      //   },
      // );
      // await this.auctionQueue.add(
      //   JobEnum.AUCTION_NOTIFICATION_ABOUT_TO_END,
      //   {
      //     id: data.id,
      //     listingId: data.listingId,
      //   },
      //   {
      //     delay: this.getDelay(aboutToEnd),
      //   },
      // );
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
