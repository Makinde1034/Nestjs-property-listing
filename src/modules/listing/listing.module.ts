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
} from './repositories';
import { ListingTypeController } from './controllers';
import { ListingService } from './services/listing.service';
import { ListingRepository } from './repositories/listing.repository';
import { ListingResolver } from './resolvers/listing.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attribute, AttributeSet, ListingType, Listing]),
  ],
  controllers: [ListingTypeController],
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
  ],
})
export class ListingModule {}
