/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

import { SystemFeatureSetting } from '../../entities/system-features.entity';

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
    const repository = dataSource.getRepository(SystemFeatureSetting);
    const data = await repository.find();

    if (data.length > 0) {
      this.logger.debug(
        `Seeding for: ${SystemSettingSeeder.name} Already completed`,
      );
    } else {
      await repository.save(data as Partial<SystemFeatureSetting>);
    }

    this.logger.debug(`Seeding for: ${SystemSettingSeeder.name} finished`);
  }
}
