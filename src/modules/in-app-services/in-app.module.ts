/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Module } from '@nestjs/common';
import { OfferRepository } from '../listing/repositories';
import { ListingRepository } from '../listing/repositories/listing.repository';
import { UserRepository } from '../user/repositories';
import { SearchHistoryRepository } from '../listing/repositories/search-history.repository';
import {
  NotificationService,
  PushNotificationService,
} from '../notification/services';
import { MailgunEmailService } from '../mail/services/implementations';
import { JobService } from './job.scheduler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../../entities';
import { NotificationRepository } from '../notification/repositories';
import { TicketRepository } from '../tickets/repositories';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
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
  ],
})
export class InAppModule {}
