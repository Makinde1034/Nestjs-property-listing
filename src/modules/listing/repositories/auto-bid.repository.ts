/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource, Repository } from 'typeorm';
import { AutoBid } from '../../../entities/auto-bid.entity';
import { Injectable } from '@nestjs/common';
@Injectable()
export class AutoBidRepository extends Repository<AutoBid> {
  constructor(private readonly dataSource: DataSource) {
    super(AutoBid, dataSource.createEntityManager());
  }
}
