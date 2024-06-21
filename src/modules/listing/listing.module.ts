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
  ],
})
export class ListingModule {}
