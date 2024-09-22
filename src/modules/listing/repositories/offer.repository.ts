/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Offer } from '../../../entities/offer.entity';
import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OfferRepository extends Repository<Offer> {
  constructor(private dataSource: DataSource) {
    super(Offer, dataSource.createEntityManager());
  }
}
