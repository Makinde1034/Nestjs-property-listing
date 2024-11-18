/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { NotificationMessageFactory } from '../factories/notification-message.factory';
import { NotificationMessages } from '../../entities/notification-message.entity';
import { SystemSetting } from '../../entities/system-features.entity';
import { SystemFactory } from '../factories/system-setting.factory';

export class SystemSettingSeeder implements Seeder {
  track = false;
  logger = new Logger(SystemSettingSeeder.name);
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    this.logger.debug(
      `Seeding For : ${SystemSettingSeeder.name}....`,
      factoryManager,
    );
    const repository = dataSource.getRepository(SystemSetting);

    await repository.save(SystemFactory);
    this.logger.debug(`Seeding for: ${SystemSettingSeeder.name} finished`);
  }
}
