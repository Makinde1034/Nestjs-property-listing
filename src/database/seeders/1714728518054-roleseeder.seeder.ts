/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Logger } from '@nestjs/common';
import { Permission, Role, User } from 'src/entities';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { roleFactory } from '../factories/role.factory';

export class RoleSeeder implements Seeder {
  track = false;
  private logger = new Logger(RoleSeeder.name);
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    this.logger.debug(`Seeding For : ${RoleSeeder.name}....`, factoryManager);
    const userRepository = dataSource.getRepository(User);
    const roleRepository = dataSource.getRepository(Role);

    const permissionRepository = dataSource.getRepository(Permission); // Ensure Permissions is imported correctly
    const [permissions, role, user] = await Promise.all([
      permissionRepository.find(),
      roleRepository.find(),

      userRepository.find({ where: { userType: 'admin' } }),
    ]);

    if (permissions.length === 0) {
      this.logger.warn(`No permissions found to associate with roles`);
    } else {
      this.logger.debug(`Permissions fetched: ${permissions.length}`);
    }
    // if (role.length > 0) {
    //   this.logger.debug(`Seeding for: ${RoleSeeder.name} Already completed`);
    // } else {
    // Transform permissions to only include id
    const permissionIds = permissions.map((permission) => ({
      id: permission.id,
    }));

    // Assuming roleFactory is an array and assigning permissionIds to each role
    roleFactory[0].permissions = permissionIds;
    roleFactory[0].user = user;

    const repository = dataSource.getRepository(Role);
    await repository.save(roleFactory);
    this.logger.debug(`Seeding for: ${Role.name} finished`);
    // }
  }
}
