/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource, Repository } from 'typeorm';
import { FlagListing } from '../../../entities/flag-listing.entity';

import { Injectable } from '@nestjs/common';
@Injectable()
export class FlagListingRepository extends Repository<FlagListing> {
  constructor(private dataSource: DataSource) {
    super(FlagListing, dataSource.createEntityManager());
  }
}
