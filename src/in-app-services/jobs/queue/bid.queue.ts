import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationQueue {
  constructor(@InjectQueue('bids') private readonly bidQueue: Queue) {}
  logger = new Logger();
  async bid(data: any) {
    try {
      await this.bidQueue.add('bid', data);
    } catch (error) {
      this.logger.log(error);
    }
  }
}
