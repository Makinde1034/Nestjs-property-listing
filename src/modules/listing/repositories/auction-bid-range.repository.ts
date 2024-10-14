/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { AuctionBidRange } from '../../../entities/auction-bid-range.entity';
@Injectable()
export class AuctionBidRangeRepository extends Repository<AuctionBidRange> {
  constructor(private readonly dataSource: DataSource) {
    super(AuctionBidRange, dataSource.createEntityManager());
  }
}
