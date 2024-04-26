/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Module } from '@nestjs/common';
import { ListingTypeResolver } from './listing-type.resolver';
import { ListingTypeService } from './listing-type.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attribute, AttributeSet } from 'src/entities';
import { AttributeRepository, AttributeSetRepository } from './repositories';

@Module({
  imports: [TypeOrmModule.forFeature([Attribute, AttributeSet])],
  providers: [
    ListingTypeResolver,
    ListingTypeService,
    AttributeRepository,
    AttributeSetRepository,
  ],
})
export class ListingTypeModule {}
