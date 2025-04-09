import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { JobEnum } from '../../../common/enums/jobs';
import { BidsRepository } from '../../../modules/listing/repositories/bids.repository';
import { BadRequestException, Logger } from '@nestjs/common';
import { AuctionParticipantRepository } from '../../../modules/listing/repositories/auction-participant.repository';
import { AuctionQueue } from '../queue/auction.queue';

@Processor('bids')
export class BidProcessor extends WorkerHost {
  constructor(
    private readonly bidRepository: BidsRepository,
    private readonly auctionParticipantRepository: AuctionParticipantRepository,
    private readonly auctionQueue: AuctionQueue,
  ) {
    super();
  }
  logger = new Logger(BidProcessor.name);

  async process(job: Job) {
    try {
      const auctionParticipant =
        await this.auctionParticipantRepository.findOne({
          where: { listingId: job.data.listingId },
        });
      if (!auctionParticipant) {
        throw new BadRequestException('Auction participant not found');
      }

      switch (job.name) {
        case JobEnum.BID:
          await this.bidRepository.save({
            price: job.data.price,
            auctionId: job.data.auctionId,
            listingId: job.data.listingId,
            bidNumber: job.data.bidNumber,
            bidderNumber: job.data.bidderNumber,
            userId: job.data.userId,
            auctionParticipantId: job.data.auctionParticipantId,
          });
          this.auctionQueue.liveAuction({
            id: job.data.auctionId,
            listingId: job.data.listingId,
          });
          break;

        default:
          break;
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
