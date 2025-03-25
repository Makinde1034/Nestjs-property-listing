/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { forwardRef, Global, Module } from '@nestjs/common';
import { OfferRepository } from '../modules/listing/repositories';
import { ListingRepository } from '../modules/listing/repositories/listing.repository';
import {
  NotificationScopeRepository,
  UserRepository,
} from '../modules/user/repositories';
import { SearchHistoryRepository } from '../modules/listing/repositories/search-history.repository';
import {
  NotificationService,
  PushNotificationService,
} from '../modules/notification/services';
import { MailgunEmailService } from '../modules/mail/services/implementations';
import { JobService } from './jobs/cron-job/cron-job';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification, NotificationScope } from '../entities';
import { NotificationRepository } from '../modules/notification/repositories';
import { TicketRepository } from '../modules/tickets/repositories';
import { AuctionRepository } from '../modules/listing/repositories/auction.repository';
import { AuctionParticipantRepository } from '../modules/listing/repositories/auction-participant.repository';

import { BullModule } from '@nestjs/bullmq';
import { JobController } from './jobs/controller/jobs.controller';
import { AuctionQueue } from './jobs/queue/auction.queue';
import { AuctionProcessor } from './jobs/processor/auction.processor';
import { BidRegistrationRepository } from '../modules/listing/repositories/bid-registration.repository';
import { BidsRepository } from '../modules/listing/repositories/bids.repository';
import { NotificationQueue } from './jobs/queue/messaging.queue';
import { NotificationProcessor } from './jobs/processor/notification.processor';

// import { InAppService } from './in-app.service';

@Global()
@Module({
  imports: [
    // TypeOrmModule.forFeature([Notification, NotificationScope]),
    BullModule.registerQueue({
      name: 'auction',
    }),
    BullModule.registerQueue({
      name: 'notification',
    }),
  ],
  controllers: [JobController],
  providers: [
    NotificationService,
    // InAppService,
    JobService,
    AuctionQueue,
    NotificationQueue,
    AuctionProcessor,
    NotificationProcessor,

    OfferRepository,
    ListingRepository,
    UserRepository,
    SearchHistoryRepository,
    // MailgunEmailService,
    // NotificationRepository,
    // PushNotificationService,
    TicketRepository,
    AuctionRepository,
    // NotificationScopeRepository,
    AuctionParticipantRepository,
    BidRegistrationRepository,
    BidsRepository,
  ],
  exports: [AuctionQueue, NotificationQueue],
})
export class InAppModule {}
