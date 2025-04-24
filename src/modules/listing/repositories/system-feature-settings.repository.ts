/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { SystemFeatureSetting } from '../../../entities/system-features.entity';

@Injectable()
export class SystemFeatureRepository extends Repository<SystemFeatureSetting> {
  constructor(private dataSource: DataSource) {
    super(SystemFeatureSetting, dataSource.createEntityManager());
  }
}
