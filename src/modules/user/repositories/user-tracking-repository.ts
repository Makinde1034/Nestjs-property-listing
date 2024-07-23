/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource, Repository } from 'typeorm';

import { UserTracking } from '../../../entities/guest-user-tracking.entity';
import { Injectable } from '@nestjs/common';
@Injectable()
export class UserTrackingRepository extends Repository<UserTracking> {
  constructor(private dataSource: DataSource) {
    super(UserTracking, dataSource.createEntityManager());
  }
}
