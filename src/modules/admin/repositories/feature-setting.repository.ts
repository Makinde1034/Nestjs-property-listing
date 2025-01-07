/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource, Repository } from 'typeorm';
import { SystemFeatureSetting } from '../../../entities/system-features.entity';
import { Injectable } from '@nestjs/common';
@Injectable()
export class SettingFeatureRepository extends Repository<SystemFeatureSetting> {
  constructor(private readonly dataSource: DataSource) {
    super(SystemFeatureSetting, dataSource.createEntityManager());
  }
}
