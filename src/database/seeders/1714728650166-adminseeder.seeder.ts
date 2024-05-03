/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Logger } from '@nestjs/common';
import { User } from 'src/entities';
import { DataSource } from 'typeorm';
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
    const hasAdmin = await repository.findOne({
      where: { email: SuperAdminData.email },
    });
    try {
      if (!hasAdmin) {
        await repository.save(SuperAdminData);
        this.logger.debug(`Seeding for: ${User.name} finished`);
      } else {
        this.logger.debug(`Seeding ${User.name}: not empty, skipping`);
      }
    } catch (error) {
      this.logger.debug(error);
    }
  }
}
