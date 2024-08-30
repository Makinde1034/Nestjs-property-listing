/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Logger } from '@nestjs/common';
import { Permission } from 'src/entities/permission.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { permissionFactory } from '../factories/permission.factory';
import slugify from 'slugify';

export class Permission1714428480148 implements Seeder {
  track = false;
  private logger = new Logger(Permission1714428480148.name);
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const permisionToSave = [];
    this.logger.debug(`Seeding For : ${Permission.name}...`, factoryManager);
    const repository = dataSource.getRepository(Permission);

    const permission = await repository.find();

    if (permission.length > 0) {
      this.logger.debug(`Seeding for: ${Permission.name} Already completed`);
    } else {
      permissionFactory.map((value) => {
        const updatedPermission = {
          ...value,
          slug: slugify(value.category + '-' + value.englishLabel, {
            remove: /[*+~./()'"!:@]/g,
            lower: true,
          }),
        };
        console.log(updatedPermission);
        permisionToSave.push(updatedPermission);
      });
      await repository.save(permisionToSave as Partial<Permission>);
    }
    this.logger.debug(`Seeding for: ${Permission.name} finished`);
  }
}
