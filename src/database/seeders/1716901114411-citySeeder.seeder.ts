/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { CityEntitity } from '../../entities/city.entity';
import { CityFactory } from '../factories/city.factory';

export class CitySeeder1716901114411 implements Seeder {
  track = false;
  private logger = new Logger(CitySeeder1716901114411.name);

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    this.logger.debug(`Seeding for: ${CityEntitity.name}...`, factoryManager);

    const repository = dataSource.getRepository(CityEntitity);

    await repository.save(CityFactory);

    this.logger.debug(`Seeding for: ${CityEntitity.name} finished`);
  }
}
