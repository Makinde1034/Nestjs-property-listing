/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Logger } from '@nestjs/common';
import {
  NotificationScope,
  Role,
  User,
  UserNotificationPreference,
} from 'src/entities';
import { DataSource, DeepPartial } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { SuperAdminData } from '../factories/admin.factory';

export class Adminseeder1714728650166 implements Seeder {
  track = false;
  private logger = new Logger(Adminseeder1714728650166.name);
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    this.logger.debug(`Seeding For : ${User.name}....`, factoryManager);
    const repository = dataSource.getRepository(User);
    const roleRepository = dataSource.getRepository(Role);
    const notificationScopeRepository =
      dataSource.getRepository(NotificationScope);
    const userNotificationPreference = dataSource.getRepository(
      UserNotificationPreference,
    );

    const hasAdmin = await repository.findOne({
      where: { email: SuperAdminData.email },
    });

    const scopes = await notificationScopeRepository.find();

    // Prepare all the notification preferences in a single array

    try {
      if (!hasAdmin) {
        const role = await roleRepository.find({
          where: { slug: 'super_admin' },
        });

        const user = await repository.save({ ...SuperAdminData, roles: role });

        const data: DeepPartial<UserNotificationPreference>[] = scopes.map(
          (scope) => ({
            user,
            scope,
          }),
        );

        // Use a single database operation to create all records

        await userNotificationPreference.save(data);

        this.logger.debug(`Seeding for: ${User.name} finished`);
      } else {
        this.logger.debug(`Seeding ${User.name}: not empty, skipping`);
      }
    } catch (error) {
      this.logger.debug(error);
    }
  }
}
