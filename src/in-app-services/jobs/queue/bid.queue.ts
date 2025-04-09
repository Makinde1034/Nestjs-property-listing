import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { FindBidInput } from '../../../modules/listing/dtos/request/bids';
import { JobEnum } from '../../../common/enums/jobs';

@Injectable()
export class BidQueue {
  constructor(@InjectQueue('bids') private readonly bidQueue: Queue) {}
  logger = new Logger();
  async bid(data) {
    try {
      const bid = await this.bidQueue.add(JobEnum.BID, {
        price: data.price,
        auctionId: data.auctionId,
        listingId: data.listingId,
        bidNumber: data.bidNumber,
        bidderNumber: data.bidderNumber,
        userId: data.userId,
        auctionParticipantId: data.auctionParticipantId,
      });
      return bid.data;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async latestBidInQueue(findBidInput: FindBidInput) {
    try {
      const allJobs = await this.bidQueue.getJobs([
        'active',
        'waiting',
        'completed',
      ]);
      const latestBids = allJobs
        .filter(
          (job) =>
            job?.data?.auctionId === findBidInput.auctionId &&
            job?.data?.listingId === findBidInput.listingId,
        )
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);

      return latestBids;
    } catch (error) {
      this.logger.error(error);
    }
  }
}
