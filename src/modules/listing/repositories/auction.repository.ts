/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource, Repository } from 'typeorm';
import { Auction } from '../../../entities/auction-table.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuctionRepository extends Repository<Auction> {
  constructor(private dataSource: DataSource) {
    super(Auction, dataSource.createEntityManager());
  }
}
