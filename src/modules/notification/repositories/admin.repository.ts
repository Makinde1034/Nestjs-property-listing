/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { AdminNotificationPreference } from '../../../entities/admin-notification-prefrence.entity';

@Injectable()
export class AdminNotificationPreferenceRepository extends Repository<AdminNotificationPreference> {
  constructor(private readonly dataSource: DataSource) {
    super(AdminNotificationPreference, dataSource.createEntityManager());
  }
}
