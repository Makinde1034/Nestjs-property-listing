import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { JobEnum } from '../../../common/enums/jobs';
import { BidsRepository } from '../../../modules/listing/repositories/bids.repository';
import { BadRequestException } from '@nestjs/common';
import { AuctionParticipantRepository } from '../../../modules/listing/repositories/auction-participant.repository';

@Processor('bids')
export class BidProcessor extends WorkerHost {
  constructor(
    private readonly bidRepository: BidsRepository,
    private readonly auctionParticipantRepository: AuctionParticipantRepository,
  ) {
    super();
  }

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
            auctionParticipant,
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
