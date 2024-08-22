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
    this.logger.debug(`Seeding for: ${ParentIssue.name}...`, factoryManager);

    // Start a transaction to ensure all seeding operations are atomic
    await dataSource.transaction(async (transactionalEntityManager) => {
      const parentRepository =
        transactionalEntityManager.getRepository(ParentIssue);
      const childIssueRepository =
        transactionalEntityManager.getRepository(ChildIssue);

      const parentIssues: DeepPartial<ParentIssue>[] = [];
      const childIssues: DeepPartial<ChildIssue>[] = [];

      try {
        // Check if parent issues already exist
        const existingParentIssues = await parentRepository.find();
        if (existingParentIssues.length > 0) {
          this.logger.warn(
            `Seeding for: ${ParentIssue.name} already completed...`,
          );
          return;
        }

        this.logger.debug('Seeding Parent Issues');

        // Group parent issues by placement and reset sequentialId for each placement
        const groupedIssues = IssueFactory.reduce(
          (acc, element) => {
            const { category, parentReason, parentArabicName } = element;
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push({
              placement: category,
              parentReason: parentReason,
              parentArabicReason: parentArabicName,
              sequentialId: acc[category].length + 1, // SequentialId restarts for each placement
            });
            return acc;
          },
          {} as Record<string, DeepPartial<ParentIssue>[]>,
        );

        // Save parent issues to the database
        const savePromises = Object.keys(groupedIssues).map(
          async (placement) => {
            const savedParentIssues = await parentRepository.save(
              groupedIssues[placement],
            );
            parentIssues.push(...savedParentIssues);
          },
        );

        await Promise.all(savePromises);

        this.logger.debug('Saved Parent Issues:');

        this.logger.debug('Seeding Child Issues');

        // Create and save child issues
        const childIssueMap = new Map<string, DeepPartial<ChildIssue>>();

        parentIssues.forEach((parentIssue) => {
          const issueData = IssueFactory.filter(
            (element) => element.category === parentIssue.placement,
          );

          issueData.forEach((element, childIndex) => {
            const childKey = `${parentIssue.id}-${element.childReason}`;
            if (!childIssueMap.has(childKey)) {
              const childIssue: DeepPartial<ChildIssue> = {
                parentIssue,
                sequentialId: childIndex + 1,
                childArabicReason: element.childArabicName,
                childReason: element.childReason,
              };
              childIssueMap.set(childKey, childIssue);
              childIssues.push(childIssue);
            }
          });
        });

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
