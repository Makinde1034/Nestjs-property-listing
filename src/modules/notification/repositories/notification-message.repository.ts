/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import { Notification } from '../../../entities';

import { DataSource, Repository } from 'typeorm';
import { NotificationMessages } from '../../../entities/notification-message.entity';

@Injectable()
export class NotificationMessagesRepository extends Repository<NotificationMessages> {
  constructor(private readonly dataSource: DataSource) {
    super(Notification, dataSource.createEntityManager());
  }
}
