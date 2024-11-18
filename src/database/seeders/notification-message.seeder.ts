/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { NotificationMessageFactory } from '../factories/notification-message.factory';
import { NotificationMessages } from '../../entities/notification-message.entity';

export class NotificationMessageSeeder implements Seeder {
  track = false;
  logger = new Logger(NotificationMessageSeeder.name);
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    this.logger.debug(
      `Seeding For : ${NotificationMessageSeeder.name}....`,
      factoryManager,
    );
    const repository = dataSource.getRepository(NotificationMessages);

    await repository.save(NotificationMessageFactory);
    this.logger.debug(
      `Seeding for: ${NotificationMessageSeeder.name} finished`,
    );
  }
}
