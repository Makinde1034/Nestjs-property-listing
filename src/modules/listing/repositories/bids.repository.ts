/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { Bids } from '../../../entities/bids.entity';

@Injectable()
export class BidsRepository extends Repository<Bids> {
  constructor(private dataSource: DataSource) {
    super(Bids, dataSource.createEntityManager());
  }
}
