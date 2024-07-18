/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Module } from '@nestjs/common';
import { ListingTypeResolver, AttributeResolver } from './resolvers';
import { ListingTypeService, AttributeService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attribute, AttributeSet, Listing, ListingType } from 'src/entities';
import {
  AttributeRepository,
  AttributeSetRepository,
  ListingTypeRepository,
  OfferRepository,
} from './repositories';
import { ListingController, ListingTypeController } from './controllers';
import { ListingService } from './services/listing.service';
import { ListingRepository } from './repositories/listing.repository';
import { ListingResolver } from './resolvers/listing.resolver';
import { Offer } from '../../entities/offer.entity';
import { OfferService } from './services/offer.service';
import { Amenities } from '../../entities/amenities.entity';
import { AmenitiesRepository } from './repositories/amenities.repository';
import { Promotion } from '../../entities/promotion.entity';
import { AdPackageService } from '../ad-package/services/ad-package.service';
import { AdPackageModule } from '../ad-package/ad-package.module';
import { PromotionRepository } from './repositories/promotion.repository';
import { FlagListingRepository } from './repositories/flag-listing.repository';
import { SearchHistoryRepository } from './repositories/search-history.repository';
import { PaymentModule } from '../payment/payment.module';
import { PaymentService } from '../payment/services/payment.service';
import { PromotionService } from './services/promotion.service';
import { FeatureRepository } from './repositories/feature.repository';
import { WishlistRepository } from './repositories/wishlist.repository';
import { WishlistService } from './services/wishlist.service';
import { NotificationService } from '../notification/services';
import { NotificationModule } from '../notification/notification.module';
import { AuctionService } from './services/auction.service';
import { AuctionRepository } from './repositories/auction.repository';
import { AuctionParticipantRepository } from './repositories/auction-participant.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Attribute,
      AttributeSet,
      ListingType,
      Listing,
      Offer,
      Amenities,
      Promotion,
    ]),
    AdPackageModule,
    PaymentModule,
    NotificationModule,
  ],
  controllers: [ListingController, ListingTypeController],
  providers: [
    ListingTypeResolver,
    ListingTypeService,
    AttributeResolver,
    AttributeService,
    AttributeRepository,
    AttributeSetRepository,
    ListingTypeRepository,
    ListingRepository,
    ListingService,
    ListingResolver,
    OfferRepository,
    OfferService,
    AmenitiesRepository,
    AdPackageService,
    PromotionRepository,
    FlagListingRepository,
    SearchHistoryRepository,
    PaymentService,
    PromotionService,
    FeatureRepository,
    WishlistRepository,
    WishlistService,
    NotificationService,
    AuctionService,
    AuctionRepository,
    AuctionParticipantRepository,
  ],
  exports: [ListingTypeService],
})
export class ListingModule {}
