/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { AdPackageFactory } from '../factories/ad-package.factory';
import { AdPackage } from '../../entities/ad-package.entity';

export class AdPackages1719713772903 implements Seeder {
  track = false;
  private logger = new Logger(AdPackages1719713772903.name);
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    this.logger.debug(
      `Seeding For : ${AdPackages1719713772903.name}...`,
      factoryManager,
    );
    const repository = dataSource.getRepository(AdPackage);
    const adPackage = await repository.find();

    if (adPackage.length > 0) {
      this.logger.debug(
        `Seeding for: ${AdPackages1719713772903.name} Already completed`,
      );
    } else {
      await repository.save(AdPackageFactory as Partial<AdPackage>);
    }

    this.logger.debug(`Seeding for: ${AdPackage.name} finished`);
  }
}
