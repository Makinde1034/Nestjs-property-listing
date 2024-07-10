/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import { Review } from '../../../entities';

import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ReviewRepository extends Repository<Review> {
  constructor(private dataSource: DataSource) {
    super(Review, dataSource.createEntityManager());
  }
}
