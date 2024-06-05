/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Logger } from '@nestjs/common';
import { Permission } from 'src/entities/permission.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { permissionFactory } from '../factories/permission.factory';

export class Permission1714428480148 implements Seeder {
  track = false;
  private logger = new Logger(Permission1714428480148.name);
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    this.logger.debug(`Seeding For : ${Permission.name}....`, factoryManager);
    const repository = dataSource.getRepository(Permission);
    const permission = await Promise.all([repository.find()]);

    if (permission[0].length > 0) {
      this.logger.debug(`Seeding for: ${Permission.name} Already completed`);
    } else {
      await repository.save(permissionFactory as Partial<Permission>);
    }
    this.logger.debug(`Seeding for: ${Permission.name} finished`);
  }
}
