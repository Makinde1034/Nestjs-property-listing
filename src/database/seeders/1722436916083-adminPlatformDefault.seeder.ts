/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { AdminPlatformDefaultFactory } from '../factories/admin-platform-default.factory';
import { AdminDefault } from '../../entities/admin-table.entity';

export class AdminPlatformDefaultSeeder implements Seeder {
  track = false;
  private logger = new Logger(AdminPlatformDefaultSeeder.name);

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    this.logger.debug(
      `Seeding For : ${AdminPlatformDefaultSeeder.name}....`,
      factoryManager,
    );

    const repository = dataSource.getRepository(AdminDefault);

    const adminDefault = await repository.find();

    if (adminDefault.length > 0) {
      this.logger.debug(
        `Seeding for: ${AdminPlatformDefaultSeeder.name} Already completed`,
      );
    } else {
      await repository.save(AdminPlatformDefaultFactory);
      this.logger.debug(
        `Seeding for: ${AdminPlatformDefaultSeeder.name} finished`,
      );
    }
  }
}
