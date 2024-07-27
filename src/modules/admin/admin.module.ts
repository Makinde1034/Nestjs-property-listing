/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Module } from '@nestjs/common';
import { ListingRepository } from '../listing/repositories/listing.repository';
import { UserRepository } from '../user/repositories';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issue, Listing, User } from '../../entities';
import { OfferRepository } from '../listing/repositories';
import { Offer } from '../../entities/offer.entity';
import { AdminResolver } from './resolver/admin.resolver';
import { UserTrackingRepository } from '../user/repositories/user-tracking-repository';
import { IssueRepository } from '../issue/repositories';
import { TransactionRepository } from '../payment/repository/transaction.repository';
import { AdminService } from './services/admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([Offer, Listing, User, Issue])],
  providers: [
    AdminResolver,
    OfferRepository,
    AdminService,
    ListingRepository,
    UserRepository,
    UserTrackingRepository,
    IssueRepository,
    TransactionRepository,
  ],
})
export class AdminModule {}
