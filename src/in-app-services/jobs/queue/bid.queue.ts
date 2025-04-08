import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { FindBidInput } from '../../../modules/listing/dtos/request/bids';

@Injectable()
export class BidQueue {
  constructor(@InjectQueue('bids') private readonly bidQueue: Queue) {}
  logger = new Logger();
  async bid(data: any) {
    try {
      return await this.bidQueue.add('bid', data);
    } catch (error) {
      this.logger.log(error);
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
      this.logger.log(error);
    }
  }
}
