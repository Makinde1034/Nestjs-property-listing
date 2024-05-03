/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Logger } from '@nestjs/common';
import { Role } from 'src/entities';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { roleFactory } from '../factories/role.factory';

export class Roleseeder1714728518054 implements Seeder {
  track = false;
  private logger = new Logger(Roleseeder1714728518054.name);
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    this.logger.debug(`Seeding For : ${Role.name}....`, factoryManager);
    const repository = dataSource.getRepository(Role);

    await repository.save(roleFactory);
    this.logger.debug(`Seeding for: ${Role.name} finished`);
  }
}
