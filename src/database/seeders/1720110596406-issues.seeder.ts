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

        // Generate parent issues using the factory
        const issueData = IssueFactory; // Assuming IssueFactory returns an array
        issueData.forEach((element, index) => {
          const issue: DeepPartial<ParentIssue> = {
            placement: element.category,
            parentReason: element.parentReason,
            parentArabicReason: element.parentArabicName,
            sequentialId: index,
          };
          parentIssues.push(issue);
        });

        // Save parent issues to the database
        const savedParentIssues = await parentRepository.save(parentIssues);
        this.logger.debug(
          `Saved Parent Issues: ${savedParentIssues.map((issue) => issue.id).join(', ')}`,
        );

        // Fetch existing child issues
        const existingChildIssues = await childIssueRepository.find();
        const existingChildMap = new Map(
          existingChildIssues.map((child) => [
            child.parentIssue.id + '.' + child.sequentialId,
            child,
          ]),
        );

        this.logger.debug('Seeding Child Issues');

        // Create and save child issues
        issueData.forEach((element, childIndex) => {
          const parentIssue = savedParentIssues.find(
            (issue) => issue.parentReason === element.parentReason,
          );
          if (parentIssue) {
            const childKey = parentIssue.id + '.' + (childIndex + 1);
            if (!existingChildMap.has(childKey)) {
              const childIssue: DeepPartial<ChildIssue> = {
                parentIssue,
                sequentialId: childIndex + 1,
                childArabicReason: element.childArabicName,
                childReason: element.childReason,
              };
              childIssues.push(childIssue);
            }
          }
        });

        if (childIssues.length > 0) {
          await childIssueRepository.save(childIssues);
          this.logger.debug('Saved Child Issues:', childIssues.length);
        }
      } catch (error) {
        this.logger.error('Error during seeding', error.stack);
        throw error;
      }
    });

    this.logger.debug(`Seeding for: ${Issue1720110596406.name} finished`);
  }
}
