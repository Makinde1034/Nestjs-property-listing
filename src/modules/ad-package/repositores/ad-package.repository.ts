/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { AdPackage } from '../../../entities/ad-package.entity';

@Injectable()
export class AdPackageRepository extends Repository<AdPackage> {
  constructor(private dataSource: DataSource) {
    super(AdPackage, dataSource.createEntityManager());
  }
}
