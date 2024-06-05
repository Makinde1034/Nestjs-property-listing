/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Logger } from '@nestjs/common';
import { Permission, Role } from 'src/entities';
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

    const permissionRepository = dataSource.getRepository(Permission); // Ensure Permissions is imported correctly
    const permissions = await permissionRepository.find();

    if (permissions.length === 0) {
      this.logger.warn(`No permissions found to associate with roles`);
    } else {
      this.logger.debug(`Permissions fetched: ${permissions.length}`);
    }

    // Transform permissions to only include id
    const permissionIds = permissions.map((permission) => ({
      id: permission.id,
    }));

    // Assuming roleFactory is an array and assigning permissionIds to each role
    roleFactory.forEach((role) => {
      role.permissions = permissionIds;
    });

    const repository = dataSource.getRepository(Role);

    await repository.save(roleFactory);
    this.logger.debug(`Seeding for: ${Role.name} finished`);
  }
}
