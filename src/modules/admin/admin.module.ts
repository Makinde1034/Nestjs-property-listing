/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Global, Module } from '@nestjs/common';
import { ListingRepository } from '../listing/repositories/listing.repository';
import { UserRepository } from '../user/repositories';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ParentIssue,
  Listing,
  User,
  Ticket,
  ListingType,
} from '../../entities';
import {
  ListingTypeRepository,
  OfferRepository,
} from '../listing/repositories';
import { Offer } from '../../entities/offer.entity';
import { AdminResolver } from './resolver/admin.resolver';
import { UserTrackingRepository } from '../user/repositories/user-tracking-repository';
import { IssueRepository } from '../issue/repositories';
import { TransactionRepository } from '../payment/repository/transaction.repository';
import { AdminService } from './services/admin.service';
import { AdminRepository } from './repositories/admin.repository';
import { AdminDefault } from '../../entities/admin-table.entity';
import { TicketRepository } from '../tickets/repositories';
import { SplashScreenService } from './services/splash-screen.service';
import { SplashScreen } from '../../entities/splash-screen.entity';
import { SplashScreenRepository } from './repositories/splash-screen.repository';
import { SplashScreenResolver } from './resolver/splash-screen.resolver';
import { SplashScreenController } from './controller/splash-screen-controller';
import { CouponRepository } from './repositories/coupons.repository';
import { AuctionBidRangeRepository } from '../listing/repositories/auction-bid-range.repository';
import { WorkFlowResolver } from './resolver/workflow.resolver';
import { WorkflowRepository } from './repositories/workflow.repository';
import { AdminWorkflowService } from './services/admin-workflow.service';
import { ActionRequestRepository } from './repositories/action.repository';
import { ActionService } from './services/action.service';
import { InvoiceRepository } from '../payment/repositories/invoice.repository';
import { SettingFeatureRepository } from './repositories/feature-setting.repository';
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Offer,
      Listing,
      User,
      ParentIssue,
      AdminDefault,
      Ticket,
      SplashScreen,
      SplashScreen,
      ListingType,
    ]),
  ],
  providers: [
    AdminResolver,
    OfferRepository,
    AdminService,
    ListingRepository,
    UserRepository,
    UserTrackingRepository,
    IssueRepository,
    TransactionRepository,
    AdminRepository,
    TicketRepository,
    SplashScreenService,
    SplashScreenRepository,
    SplashScreenResolver,
    CouponRepository,
    AuctionBidRangeRepository,
    WorkFlowResolver,
    WorkflowRepository,
    AdminWorkflowService,
    ActionRequestRepository,
    ActionService,
    ListingTypeRepository,
    InvoiceRepository,
    SettingFeatureRepository,
  ],

  controllers: [SplashScreenController],
  exports: [
    AdminService,
    AdminRepository,
    SplashScreenService,
    UserTrackingRepository,
    TicketRepository,
    CouponRepository,
    ListingRepository,
    ActionService,
    AdminWorkflowService,
    TransactionRepository,
    SettingFeatureRepository,
  ],
})
export class AdminModule {}
