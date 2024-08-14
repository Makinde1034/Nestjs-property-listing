/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { IssueCategoryRepository, IssueRepository } from '../repositories';
import { ChildIssue, IssueCategory, ParentIssue } from 'src/entities';
import {
  CreateIssueCategoryInput,
  DeleteIssueInput,
  CreateIssueInput,
  UpdateIssueInput,
} from '../dtos';
import { AppStrings } from 'src/common/messages/app.strings';
import { ChildIssueRepository } from '../repositories/child-issue.repository';
import { EntityManager, MoreThanOrEqual } from 'typeorm';

@Injectable()
export class IssueService {
  constructor(
    private readonly issueCategoryRepository: IssueCategoryRepository,
    private readonly issueRepository: IssueRepository,
    private readonly childIssueRepository: ChildIssueRepository,
  ) {}

  logger = new Logger(IssueService.name);

  /**
   * List Issue Category
   *
   * @async
   * @returns {Promise<IssueCategory[]>}
   */
  async findAllIssueCategories(): Promise<IssueCategory[]> {
    return await this.issueCategoryRepository.findAll();
  }

  /**
   * Create Issue Category
   * @async
   * @param {CreateIssueCategoryInput} data
   * @returns {Promise<IssueCategory>}
   */
  async createCategory(data: CreateIssueCategoryInput): Promise<IssueCategory> {
    return await this.issueCategoryRepository.create(data);
  }

  /**
   * Update Issue Category
   *
   * @async
   * @param {UpdateIssueCategoryInput} data
   * @returns {Promise<IssueCategory>}
   */
  async updateIssue(input: UpdateIssueInput): Promise<ParentIssue> {
    const { id, sequentialId, ...data } = input;

    if (sequentialId !== undefined && sequentialId <= 0) {
      throw new BadRequestException('SequentialId must be greater than 0');
    }

    // Validate that the issue exists
    const issue = await this.issueRepository.findOneByOrFail({ id });

    return await this.issueRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        // Update the issue with the provided data
        await transactionalEntityManager.update(ParentIssue, id, data);

        if (sequentialId !== undefined) {
          // Fetch records with a sequentialId greater than or equal to the input's sequentialId
          const records = await transactionalEntityManager.find(ParentIssue, {
            where: {
              sequentialId: MoreThanOrEqual(sequentialId),
              issueCategoryId: issue.issueCategoryId,
            },
            order: { sequentialId: 'ASC' },
          });

          // Update the sequentialId for the current issue
          await transactionalEntityManager.update(ParentIssue, id, {
            sequentialId: sequentialId,
          });
          let newSequentialId = sequentialId + 1;

          // Prepare records for update
          const updatedRecords = records
            .filter(
              (record) =>
                record.id !== id && record.sequentialId >= sequentialId,
            )
            .map((record) => {
              record.sequentialId = newSequentialId;
              newSequentialId += 1;
              return record;
            });

          // Save updated records if any
          if (updatedRecords.length > 0) {
            await transactionalEntityManager.save(ParentIssue, updatedRecords);
          }
        }

        // Return the updated issue
        return await transactionalEntityManager.findOneOrFail(ParentIssue, {
          where: { id },
          order: { sequentialId: 'ASC' },
        });
      },
    );
  }

  /**
   * Delete Issue Category
   *
   * @async
   * @param {DeleteIssueInput} data
   * @returns {Promise<string>}
   */
  async deleteCategory(data: DeleteIssueInput): Promise<string> {
    const category = await this.issueCategoryRepository.findByIdOrFail(data.id);
    if (category.parentIssues && category.parentIssues.length > 0) {
      throw new BadRequestException(AppStrings.UNABLE_TO_DELETE_ISSUE_CATEGORY);
    }
    await this.issueCategoryRepository.delete(data.id);
    return AppStrings.ISSUE_CATEGORY_DELETED_SUCCESSFULLY;
  }

  /**
   * List Issues
   *
   * @async
   * @returns {Promise<Issue[]>}
   */

  async findAllIssuesByCategory(id: string): Promise<ParentIssue[]> {
    return await this.issueRepository.find({
      where: { issueCategoryId: id },
      order: { sequentialId: 'ASC' },
    });
  }

  async findAllChildIssues(id: string): Promise<ChildIssue[]> {
    return await this.childIssueRepository.find({
      where: {
        parentIssue: { id: id },
      },
    });
  }

  /**
   * Create Issue
   *
   * @async
   * @param {CreateIssueInput} input
   * @returns {Promise<Issue>}
   */
  async createIssue(payload: CreateIssueInput): Promise<ParentIssue> {
    try {
      const { sequentialId, ...input } = payload;
      const count = await this.issueRepository.count({
        where: { issueCategoryId: input.categoryId },
      });
      const category = await this.issueCategoryRepository.findByIdOrFail(
        input.categoryId,
      );
      if (category) {
        throw new BadRequestException(AppStrings.ISSUE_CATEGORY_NOT_FOUND);
      }
      const data: Partial<ParentIssue> = {
        parentReason: input.parentReason,
        parentArabicReason: input.parentArabicReason,
        sequentialId: count,
        issueCategoryId: input.categoryId,
      };

      const createdIssue = await this.issueRepository.save(data);

      if (sequentialId !== undefined && sequentialId <= 0) {
        throw new BadRequestException('SequentialId must be greater than 0');
      }

      // Validate that the issue exists

      return await this.issueRepository.manager.transaction(
        async (transactionalEntityManager: EntityManager) => {
          // Update the issue with the provided data
          await transactionalEntityManager.update(
            ParentIssue,
            createdIssue.id,
            data,
          );

          if (sequentialId !== undefined) {
            // Fetch records with a sequentialId greater than or equal to the input's sequentialId
            const records = await transactionalEntityManager.find(ParentIssue, {
              where: {
                sequentialId: MoreThanOrEqual(sequentialId),
                issueCategoryId: createdIssue.issueCategoryId,
              },
              order: { sequentialId: 'ASC' },
            });

            // Update the sequentialId for the current issue
            await transactionalEntityManager.update(
              ParentIssue,
              createdIssue.id,
              {
                sequentialId: sequentialId,
              },
            );
            let newSequentialId = sequentialId + 1;

            // Prepare records for update
            const updatedRecords = records
              .filter(
                (record) =>
                  record.id !== createdIssue.id &&
                  record.sequentialId >= sequentialId,
              )
              .map((record) => {
                record.sequentialId = newSequentialId;
                newSequentialId += 1;
                return record;
              });

            // Save updated records if any
            if (updatedRecords.length > 0) {
              await transactionalEntityManager.save(
                ParentIssue,
                updatedRecords,
              );
            }
          }

          // Return the updated issue
          return await transactionalEntityManager.findOneOrFail(ParentIssue, {
            where: { id: createdIssue.id },
            order: { sequentialId: 'ASC' },
          });
        },
      );
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  /**
   * Update Issue
   *
   * @async
   * @param {UpdateIssueInput} input
   * @returns {Promise<Issue>}
   */

  // Async updateParentIssue(input: UpdateIssueInput): Promise<ParentIssue> {
  // Const data: Partial<ParentIssue> = {
  //   ...input,
  // };
  // Const result = await this.issueRepository.update(input.id, data);

  // If (result.affected > 0) {
  //   Return await this.issueRepository.findOneBy({ id: input.id });
  // }

  // If (input.sequentialId) {
  //   Const records = await this.issueRepository.find({
  //     Order: { sequentialId: 'ASC' },
  //     Where: {
  //       SequentialId: MoreThan(input.sequentialId),
  //     },
  //   });
  //   Let newValue = input.sequentialId;

  //   // Update the value of each record
  //   Const updatedRecords = records.map((record) => {
  //     NewValue = newValue + 1;
  //     Record.sequentialId = newValue;
  //     Return record;
  //   });

  //   // Save the updated records back to the database
  //   Await this.issueRepository.save(updatedRecords);
  // }
  // }

  /**
   * Delete issue
   *
   * @async
   * @param {DeleteIssueInput} data
   * @returns {Promise<string>}
   */
  async deleteIssue(data: DeleteIssueInput): Promise<string> {
    await this.issueRepository.delete(data.id);
    return AppStrings.ISSUE_DELETED_SUCCESSFULLY;
  }
}
