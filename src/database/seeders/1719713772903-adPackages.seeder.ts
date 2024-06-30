/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { AdPackage } from '../../entities/ad-package.entity';
import { AdPackageFactory } from '../factories/ad-package.factory';

export class AdPackages1719713772903 implements Seeder {
  track = false;
  private logger = new Logger(AdPackages1719713772903.name);
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    this.logger.debug(`Seeding For : ${AdPackage.name}...`, factoryManager);
    dataSource.getRepository(AdPackage);
    await dataSource.transaction(async (transactionalEntityManager) => {
      // Delete all existing records
      //   Await transactionalEntityManager.delete(AdPackage, {});

      // Insert new records
      await transactionalEntityManager.save(
        AdPackage,
        AdPackageFactory as Partial<AdPackage>[],
      );
    });
    this.logger.debug(`Seeding for: ${AdPackage.name} finished`);
  }
}
