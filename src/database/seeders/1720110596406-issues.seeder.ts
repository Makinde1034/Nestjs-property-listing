/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { ChildIssueFactory } from '../factories/child.factory';
import { ChildIssue, IssueCategory, ParentIssue } from '../../entities';
import { ParentIssueFactory } from '../factories/parent-issue';
import { IssuesCategoryFactory } from '../factories/issue-category';

export class Issue1720110596406 implements Seeder {
  track = false;
  private logger = new Logger(Issue1720110596406.name);
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    this.logger.debug(`Seeding For : ${ParentIssue.name}...`, factoryManager);
    const parentRepository = dataSource.getRepository(ParentIssue);
    const childIssueRepository = dataSource.getRepository(ChildIssue);
    const categoryRepository = dataSource.getRepository(IssueCategory);

    let parentIssues;
    let childIssue;

    const category = await categoryRepository.find();

    if (category.length > 0) {
      this.logger.debug(`Seeding for: ${IssueCategory.name} Already completed`);
    } else {
      await parentRepository.save(
        IssuesCategoryFactory as Partial<IssueCategory>,
      );
      const [createdCategory, parent] = await Promise.all([
        await categoryRepository.find(),
        await parentRepository.find(),
      ]);

      if (parent.length > 0) {
        this.logger.debug(
          `Seeding for: ${ParentIssue.name} Already completed. If you want to  update Issues, you need to delete category table, child_issue table and parent_issue table`,
        );
      } else {
        createdCategory.map((category) => {
          parentIssues = ParentIssueFactory.map(() => {});
        });

        await parentRepository.save(parentIssues as Partial<ParentIssue>);

        const childIssue = await childIssueRepository.find();

        if (childIssue.length > 0) {
          this.logger.debug(
            `Seeding for: ${ChildIssue.name} Already completed`,
          );
        } else {
          await parentRepository.save(ChildIssueFactory as Partial<ChildIssue>);
        }
      }

      this.logger.debug(`Seeding for: ${Issue1720110596406.name} finished`);
    }
  }
}
