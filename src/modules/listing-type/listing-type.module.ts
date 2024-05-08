/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Module } from '@nestjs/common';
import { ListingTypeResolver, AttributeResolver } from './resolvers';
import { ListingTypeService, AttributeService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attribute, AttributeSet, ListingType } from 'src/entities';
import {
  AttributeRepository,
  AttributeSetRepository,
  ListingTypeRepository,
} from './repositories';
import { ListingTypeController } from './controllers';

@Module({
  imports: [TypeOrmModule.forFeature([Attribute, AttributeSet, ListingType])],
  controllers: [ListingTypeController],
  providers: [
    ListingTypeResolver,
    ListingTypeService,
    AttributeResolver,
    AttributeService,
    AttributeRepository,
    AttributeSetRepository,
    ListingTypeRepository,
  ],
})
export class ListingTypeModule {}
