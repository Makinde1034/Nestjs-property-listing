/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ActivityLog } from '../../../entities/activity-log.entity';

@Injectable()
export class ActivityLogRepository extends Repository<ActivityLog> {
  constructor(private readonly dataSource: DataSource) {
    super(ActivityLog, dataSource.createEntityManager());
  }
}
