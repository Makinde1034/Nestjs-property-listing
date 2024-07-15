/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

import { Logger } from '@nestjs/common';
import { Attribute } from '../../entities/attribute.entity';
import { AttributeFactory } from '../factories/attributes.factory';

export class AttributeSeeder implements Seeder {
  track = false;
  private logger = new Logger(AttributeSeeder.name);
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    this.logger.debug(`Seeding For : ${Attribute.name}...`, factoryManager);
    const repository = dataSource.getRepository(Attribute);

    const AttributeRepository = await Promise.all([repository.find()]);

    if (AttributeRepository[0].length == AttributeFactory.length) {
      this.logger.debug(`Seeding for: ${Attribute.name} Already completed`);
    } else {
      await repository.save(AttributeFactory as Partial<Attribute>);
    }
    this.logger.debug(`Seeding for: ${Attribute.name} finished`);
  }
}
