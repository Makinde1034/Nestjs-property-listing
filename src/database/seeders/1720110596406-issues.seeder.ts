/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Logger } from '@nestjs/common';
import { DataSource, DeepPartial } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { ChildIssue, ParentIssue } from '../../entities';
import { IssueFactory } from '../factories/issue.factory';

export class Issue1720110596406 implements Seeder {
  private logger = new Logger(Issue1720110596406.name);

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    this.logger.debug(`Seeding for: ${ParentIssue.name}...`);

    await dataSource.transaction(async (transactionalEntityManager) => {
      const parentRepository =
        transactionalEntityManager.getRepository(ParentIssue);
      const childIssueRepository =
        transactionalEntityManager.getRepository(ChildIssue);

      try {
        const existingParentIssues = await parentRepository.find();

        if (existingParentIssues.length > 0) {
          this.logger.warn(
            `Seeding for: ${ParentIssue.name} already completed...`,
          );
          return;
        }

        this.logger.debug('Seeding Parent Issues');

        const groupedIssues = IssueFactory.reduce(
          (acc, element) => {
            const { category, parentReason, parentArabicName } = element;
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push({
              placement: category,
              englishName: parentReason,
              arabicName: parentArabicName,
              sequentialId: acc[category].length + 1,
            });
            return acc;
          },
          {} as Record<string, DeepPartial<ParentIssue>[]>,
        );

        // Save parent issues in a batch to reduce potential race conditions
        const savedParentIssues = await Promise.all(
          Object.keys(groupedIssues).map((placement) =>
            parentRepository.save(groupedIssues[placement]),
          ),
        ).then((results) => results.flat());

        this.logger.debug('Saved Parent Issues:', savedParentIssues.length);

        this.logger.debug('Seeding Child Issues');

        const childIssues = [];

        // Ensure unique child issues by associating them correctly with their parent issue
        for (const parentIssue of savedParentIssues) {
          const issueData = IssueFactory.filter(
            (element) => element.category === parentIssue.placement,
          );

          issueData.forEach((element, childIndex) => {
            const existingChildIssue = childIssues.find(
              (ci) =>
                ci.parentIssue.id === parentIssue.id &&
                ci.englishName === element.childReason,
            );

            if (!existingChildIssue) {
              const childIssue: DeepPartial<ChildIssue> = {
                parentIssue,
                sequentialId: childIndex + 1,
                arabicName: element.childArabicName,
                englishName: element.childReason,
              };
              childIssues.push(childIssue);
            }
          });
        }

        if (childIssues.length > 0) {
          await childIssueRepository.save(childIssues);
          this.logger.debug(`Saved Child Issues: ${childIssues.length}`);
        }
      } catch (error) {
        this.logger.error('Error during seeding', error.stack);
        throw error;
      }
    });

    this.logger.debug(`Seeding for: ${Issue1720110596406.name} finished`);
  }
}
