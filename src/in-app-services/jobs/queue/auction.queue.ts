import { InjectQueue } from '@nestjs/bullmq';
import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { Auction } from '../../../entities/auction-table.entity';
import { JobEnum } from '../../../common/enums/jobs';
import { subMinutes } from 'date-fns';
import { AuctionRepository } from '../../../modules/listing/repositories/auction.repository';

@Injectable()
export class AuctionQueue {
  constructor(
    @InjectQueue('auction')
    private auctionQueue: Queue,
    private readonly auctionRepository: AuctionRepository,
  ) {}
  logger = new Logger();
  // async auctionEndInFifteenMinutes(auction: AuctionParticipant) {
  //   try {
  //     const notifyTime = subMinutes(auction.expireAt, 15);
  //     const delay = this.getDelay(notifyTime);

  //     const job = await this.auctionQueue.add(
  //       JobEnum.AUCTION_NOTIFICATION_ABOUT_TO_END,
  //       {
  //         id: auction.id,
  //         listingId:
  //        },
  //       {
  //         delay: delay,
  //       },
  //     );
  //   } catch (error) {
  //     throw new UnprocessableEntityException(error);
  //   }
  // }

  async auctionEndInOneMinute(auction: Auction, data: any) {
    try {
      const notifyTime = subMinutes(auction.expireAt, 1);
      const delay = this.getDelay(notifyTime);

      const job = await this.auctionQueue.add(
        JobEnum.AUCTION_NOTIFICATION_ABOUT_TO_END,
        { id: auction.id },
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
        where: { id: data.auctionId },
      });
      const notifyTime = auction.expireAt;
      const delay = this.getDelay(notifyTime);

      const job = await this.auctionQueue.add(
        JobEnum.AUCTION_WINNER,
        {
          auctionId: auction.id,
          listingId: data.listingId,
        },
        // {
        //   delay: 10,
        // },
      );
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }

  private getDelay = (targetDate: Date): number => {
    const now = new Date().getTime();
    const targetTime = new Date(targetDate).getTime();
    const delay = targetTime - now;
    return delay > 0 ? delay : 0; // Ensure delay is non-negative
  };
}
