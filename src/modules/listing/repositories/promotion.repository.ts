/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { Promotion } from '../../../entities/promotion.entity';

@Injectable()
export class PromotionRepository extends Repository<Promotion> {
  constructor(private dataSource: DataSource) {
    super(Promotion, dataSource.createEntityManager());
  }
}
