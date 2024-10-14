/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Module } from '@nestjs/common';
import { OfferRepository } from '../listing/repositories';
import { ListingRepository } from '../listing/repositories/listing.repository';
import {
  NotificationScopeRepository,
  UserRepository,
} from '../user/repositories';
import { SearchHistoryRepository } from '../listing/repositories/search-history.repository';
import {
  NotificationService,
  PushNotificationService,
} from '../notification/services';
import { MailgunEmailService } from '../mail/services/implementations';
import { JobService } from './job.scheduler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification, NotificationScope } from '../../entities';
import { NotificationRepository } from '../notification/repositories';
import { TicketRepository } from '../tickets/repositories';
import { AuctionRepository } from '../listing/repositories/auction.repository';
import { AuctionParticipantRepository } from '../listing/repositories/auction-participant.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, NotificationScope])],
  providers: [
    JobService,
    OfferRepository,
    ListingRepository,
    UserRepository,
    SearchHistoryRepository,
    MailgunEmailService,
    NotificationService,
    NotificationRepository,
    PushNotificationService,
    TicketRepository,
    AuctionRepository,
    NotificationScopeRepository,
    AuctionParticipantRepository,
  ],
})
export class InAppModule {}
