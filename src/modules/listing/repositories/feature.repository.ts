/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { Feature } from '../../../entities/feature.entity';

@Injectable()
export class FeatureRepository extends Repository<Feature> {
  constructor(private dataSource: DataSource) {
    super(Feature, dataSource.createEntityManager());
  }
}
