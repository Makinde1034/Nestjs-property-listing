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
  ): Promise<any> {
    this.logger.debug(
      `Seeding For : ${NotificationScope.name}....`,
      factoryManager,
    );
    const repository = dataSource.getRepository(NotificationScope);

    const data = await repository.find();

    if (data.length > 0) {
      this.logger.debug(
        `Seeding for: ${NotificationScope.name} Already completed`,
      );
    } else {
      await repository.save(
        NotificationScopeFactory as Partial<NotificationScope>,
      );
    }

    await repository.save(NotificationScopeFactory);
    this.logger.debug(`Seeding for: ${NotificationScope.name} finished`);
  }
}
