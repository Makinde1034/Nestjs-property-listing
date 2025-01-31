/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Logger } from '@nestjs/common';
import { NotificationScope } from 'src/entities';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { NotificationScopeFactory } from '../factories/notification-scope.factory';
export class NotificationScopeSeeder implements Seeder {
  track = false;
  private logger = new Logger(NotificationScopeSeeder.name);

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    this.logger.debug(`Seeding For: ${NotificationScope.name}....`);

    const repository = dataSource.getRepository(NotificationScope);

    // Check if there is existing data
    const existingCount = await repository.count();
    if (existingCount > 0) {
      this.logger.debug(
        `Seeding for: ${NotificationScope.name} already completed. Skipping...`,
      );
      return; // Exit early to prevent duplicate inserts
    }

    // Insert the NotificationScopeFactory array
    await repository.save(NotificationScopeFactory);

    this.logger.debug(`Seeding for: ${NotificationScope.name} finished.`);
  }
}
