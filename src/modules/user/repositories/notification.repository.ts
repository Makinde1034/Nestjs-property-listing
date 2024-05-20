/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import {
  UserNotificationPreference,
  NotificationScope,
} from '../../../entities';
import { EntityRepository } from '../../core/base.class/entity.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import BaseRepository from 'src/modules/core/base.class/base.repository';

@Injectable()
export class UserNotificationRepository extends EntityRepository<UserNotificationPreference> {
  constructor(
    @InjectRepository(UserNotificationPreference)
    private readonly repository: Repository<UserNotificationPreference>,
  ) {
    super(repository);
  }
}

export class NotificationScopeRepository extends BaseRepository<NotificationScope> {
  constructor(
    @InjectRepository(NotificationScope)
    private readonly repository: Repository<NotificationScope>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }
}
