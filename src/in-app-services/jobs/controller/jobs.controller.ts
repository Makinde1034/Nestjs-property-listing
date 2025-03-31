import { Body, Controller, Post } from '@nestjs/common';
import { AuctionQueue } from '../queue/auction.queue';
import { Public } from '../../../modules/auth/decorators/permision.decorator';
import { AuctionRepository } from '../../../modules/listing/repositories/auction.repository';

@Controller('jobs')
export class JobController {
  constructor(
    private auctionQueue: AuctionQueue,
    private readonly auctionrepository: AuctionRepository,
  ) {}

  @Post('queue')
  @Public()
  async addToQueue(@Body() data: any) {
    await this.auctionQueue.auctionEnd(data);
  }
}
