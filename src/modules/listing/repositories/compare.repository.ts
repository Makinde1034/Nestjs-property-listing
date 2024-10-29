/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Compare } from '../../../entities/compare.entity';

@Injectable()
export class CompareRepository extends Repository<Compare> {
  constructor(private readonly dataSource: DataSource) {
    super(Compare, dataSource.createEntityManager());
  }
}
