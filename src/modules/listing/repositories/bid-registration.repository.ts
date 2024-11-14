/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { BidRegistration } from '../../../entities/bid-registration.entity';

@Injectable()
export class BidRegistrationRepository extends Repository<BidRegistration> {
  constructor(private readonly dataSource: DataSource) {
    super(BidRegistration, dataSource.createEntityManager());
  }
}
