/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

import { Logger } from '@nestjs/common';
import { Amenities } from '../../entities/amenities.entity';
import { AmenitiesFactory } from '../factories/amenities.factory';

export class AmenitiesSeeder1718277442397 implements Seeder {
  track = false;
  private logger = new Logger(AmenitiesSeeder1718277442397.name);
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    this.logger.debug(`Seeding For : ${Amenities.name}...`, factoryManager);
    const repository = dataSource.getRepository(Amenities);
    const amenitiesRepository = await Promise.all([repository.find()]);

    if (amenitiesRepository[0].length == AmenitiesFactory.length) {
      this.logger.debug(`Seeding for: ${Amenities.name} Already completed`);
    } else {
      await repository.clear();
      await repository.save(AmenitiesFactory as Partial<Amenities>);
    }
    this.logger.debug(`Seeding for: ${Amenities.name} finished`);
  }
}
