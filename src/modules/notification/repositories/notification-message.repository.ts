/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';
import { NotificationMessages } from '../../../entities/notification-message.entity';

@Injectable()
export class NotificationMessagesRepository extends Repository<NotificationMessages> {
  constructor(private readonly dataSource: DataSource) {
    super(NotificationMessages, dataSource.createEntityManager());
  }
}
