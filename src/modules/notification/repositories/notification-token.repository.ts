/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';
import { NotificationToken } from '../../../entities/notification-token.entity';

@Injectable()
export class NotificationTokenRepository extends Repository<NotificationToken> {
  constructor(private readonly dataSource: DataSource) {
    super(NotificationToken, dataSource.createEntityManager());
  }
}
