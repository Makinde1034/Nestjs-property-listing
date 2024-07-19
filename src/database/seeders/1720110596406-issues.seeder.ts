/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { Issue } from '../../entities';
import { IssueFactory } from '../factories/issues.factory';

export class Issue1720110596406 implements Seeder {
  track = false;
  private logger = new Logger(Issue1720110596406.name);
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    this.logger.debug(`Seeding For : ${Issue.name}...`, factoryManager);
    const repository = dataSource.getRepository(Issue);

    const issue = await repository.find();

    if (issue.length > 0) {
      this.logger.debug(`Seeding for: ${Issue.name} Already completed`);
    } else {
      await repository.save(IssueFactory as Partial<Issue>);
    }

    this.logger.debug(`Seeding for: ${Issue1720110596406.name} finished`);
  }
}
