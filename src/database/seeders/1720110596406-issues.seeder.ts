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

        // Create a map to track unique ParentIssues by their key attributes
        const parentIssueMap = new Map<string, Partial<ParentIssue>>();

        IssueFactory.forEach((element) => {
          const key = `${element.category}-${element.parentReason}-${element.parentArabicName}`;
          if (!parentIssueMap.has(key)) {
            parentIssueMap.set(key, {
              placement: element.category,
              englishName: element.parentReason,
              arabicName: element.parentArabicName,
              sequentialId: parentIssueMap.size + 1, // SequentialId restarts for each placement
            });
          }
        });

        // Convert the map values to an array and save all unique parent issues
        const uniqueParentIssues = Array.from(parentIssueMap.values());
        const savedParentIssues =
          await parentRepository.save(uniqueParentIssues);

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
