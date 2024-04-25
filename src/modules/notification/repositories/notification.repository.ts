/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import { Notification } from '../../../entities';
import { EntityRepository } from '../../core/base.class/entity.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationRepository extends EntityRepository<Notification> {
  constructor(
    @InjectRepository(Notification)
    private readonly repository: Repository<Notification>,
  ) {
    super(repository);
  }
}
