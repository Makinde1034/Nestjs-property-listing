/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { ChildIssue, ParentIssue, User } from 'src/entities';
import {
  CreateIssueInput,
  UpdateIssueInput,
  CreateChildIssueInput,
  UpdateChildIssueInput,
} from '../dtos';
import { AppStrings } from 'src/common/messages/app.strings';
import { ChildIssueRepository } from '../repositories/child-issue.repository';
import { EntityManager, MoreThanOrEqual } from 'typeorm';
import { IssueRepository } from '../repositories';
import { SuccessResponse } from '../../../common/utils/success.response';
import { ActivityLogService } from '../../activity-log/services/activity-log.service';
import { ActivityEnum } from '../../../common/enums/activitys';

@Injectable()
export class IssueService {
  constructor(
    private readonly issueRepository: IssueRepository,
    private readonly childIssueRepository: ChildIssueRepository,

    private readonly activityLogService: ActivityLogService,
  ) {}

  logger = new Logger(IssueService.name);
  /**
   * Create Issue
   * @async
   * @param {CreateIssueInput} payload
   * @returns {Promise<Issue>}
   */
  async createIssue(
    payload: CreateIssueInput,
    admin: User,
  ): Promise<ParentIssue> {
    try {
      const { sequentialId, ...input } = payload;
      const count = await this.issueRepository.count({
        where: { placement: input.placement },
      });

      const data: Partial<ParentIssue> = {
        englishName: input.englishName,
        arabicName: input.arabicName,
        sequentialId: count,
        placement: input.placement,
      };

      const createdIssue = await this.issueRepository.save(data);

      if (sequentialId !== undefined && sequentialId <= 0) {
        throw new BadRequestException('SequentialId must be greater than 0');
      }

      // Validate that the issue exists

      const result = await this.issueRepository.manager.transaction(
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
                placement: createdIssue.placement,
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

      await this.activityLogService.logActivity([
        {
          adminId: admin.id,
          action: ActivityEnum.CREATED,
          details: JSON.stringify(data),
          placement: data.placement,
        },
      ]);

      return result;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async findAllIssuesByPlacement(placement?: string): Promise<ParentIssue[]> {
    try {
      // Build query dynamically to avoid redundant database operations
      const query = this.issueRepository
        .createQueryBuilder('issue')
        .leftJoinAndSelect('issue.childIssue', 'childIssue') // Fetch related child issues
        .orderBy('issue.sequentialId', 'ASC'); // Order by sequentialId

      // Add placement filter if provided
      if (placement) {
        query.where('issue.placement = :placement', { placement });
      }

      return await query.getMany(); // Execute query
    } catch (error) {
      this.logger.error('Error fetching issues by placement', error.stack);
      throw new BadRequestException('Failed to fetch issues');
    }
  }

  async updateIssue(
    input: UpdateIssueInput,
    admin: User,
  ): Promise<ParentIssue> {
    const { id, sequentialId, ...data } = input;

    if (sequentialId !== undefined && sequentialId <= 0) {
      throw new BadRequestException('SequentialId must be greater than 0');
    }

    // Validate that the issue exists
    const issue = await this.issueRepository.findOneByOrFail({ id });

    const result = await this.issueRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        // Update the issue with the provided data
        await transactionalEntityManager.update(ParentIssue, id, data);

        if (sequentialId !== undefined) {
          // Fetch records with a sequentialId greater than or equal to the input's sequentialId
          const records = await transactionalEntityManager.find(ParentIssue, {
            where: {
              sequentialId: MoreThanOrEqual(sequentialId),
              placement: issue.placement,
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

    await this.activityLogService.logActivity([
      {
        adminId: admin.id,
        action: ActivityEnum.UPDATED,
        details: JSON.stringify(data),
        placement: issue.placement,
      },
    ]);

    return result;
  }

  /**
   * Delete issue
   *
   * @async
   * @param {String} id
   * @returns {Promise<string>}
   */
  async deleteIssue(id: string, admin: User) {
    const issue = await this.issueRepository.findOneBy({ id });

    if (!issue) {
      throw new BadRequestException(AppStrings.NOT_FOUND);
    }

    await this.issueRepository.softDelete(id);

    const { sequentialId, placement } = issue;

    await this.activityLogService.logActivity([
      {
        adminId: admin.id,
        action: ActivityEnum.DELETED,
        details: JSON.stringify(issue),
        placement: placement,
      },
    ]);
    await this.issueRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        if (sequentialId !== undefined) {
          // Fetch records with a sequentialId greater than or equal to the input's sequentialId
          const records = await transactionalEntityManager.find(ParentIssue, {
            where: {
              sequentialId: MoreThanOrEqual(sequentialId),
              placement: placement,
            },
            order: { sequentialId: 'ASC' },
          });

          // Update the sequentialId for the subsequent issues
          let newSequentialId = sequentialId;

          records.forEach((record) => {
            record.sequentialId = newSequentialId;
            newSequentialId += 1;
          });

          // Save updated records
          await transactionalEntityManager.save(ParentIssue, records);
        }
      },
    );
    return new SuccessResponse(AppStrings.ISSUE_DELETED_SUCCESSFULLY);
  }

  /*********************************
   * Child Issue
   *********************************/

  async createChildIssue(
    payload: CreateChildIssueInput,
    admin: User,
  ): Promise<ChildIssue> {
    const { parentId, ...data } = payload;
    const parentIssue = await this.issueRepository.findOneByOrFail({
      id: parentId,
    });
    if (!parentIssue) {
      throw new BadRequestException('Parent Issue not found');
    }
    const childIssue = await this.childIssueRepository.save({
      ...data,
      parentIssue,
    });

    await this.activityLogService.logActivity([
      {
        adminId: admin.id,
        action: ActivityEnum.CREATED,
        details: JSON.stringify(childIssue),
        placement: childIssue.parentIssue.placement,
      },
    ]);

    return childIssue;
  }

  async updateChildIssue(updateChildissue: UpdateChildIssueInput, admin: User) {
    try {
      const { id, ...rest } = updateChildissue;
      const childIssue = await this.childIssueRepository.findOneBy({
        id,
      });

      if (!childIssue) {
        throw new BadRequestException(AppStrings.NOT_FOUND);
      }
      const childIssueCount = await this.childIssueRepository.count();
      rest.sequentialId = childIssueCount + 1;

      const { affected } = await this.childIssueRepository.update(id, rest);

      if (affected > 0) {
        await this.activityLogService.logActivity([
          {
            adminId: admin.id,
            action: ActivityEnum.UPDATED,
            details: JSON.stringify(childIssue),
            placement: childIssue.parentIssue.placement,
          },
        ]);
        return await this.childIssueRepository.findOneByOrFail({ id });
      }
    } catch (error) {
      this.logger.log(error);

      throw new BadRequestException(error);
    }
  }
  async findAllChildIssues(id: string): Promise<ChildIssue[]> {
    try {
      return await this.childIssueRepository.find({
        where: {
          parentIssue: { id: id },
        },
      });
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(AppStrings.NOT_FOUND);
    }
  }

  async deleteChildIssue(id: string, admin: User) {
    try {
      const issue = await this.childIssueRepository.findOne({
        where: { id },
        relations: ['parentIssue'],
      });
      if (!issue) {
        throw new BadRequestException(AppStrings.NOT_FOUND);
      }

      const { sequentialId, parentIssueId } = issue;

      await this.issueRepository.manager.transaction(
        async (transactionalEntityManager: EntityManager) => {
          if (sequentialId !== undefined) {
            this.logger.debug(
              'Fetching records with sequentialId >=',
              sequentialId,
            );
            const records = await transactionalEntityManager.find(ChildIssue, {
              where: {
                sequentialId: MoreThanOrEqual(sequentialId),
                parentIssueId: parentIssueId,
              },
              order: { sequentialId: 'ASC' },
            });

            if (records.length > 0) {
              this.logger.debug('Updating sequentialIds for subsequent issues');
              let newSequentialId = sequentialId;

              records.forEach((record) => {
                record.sequentialId = newSequentialId;
                newSequentialId += 1;
              });

              await transactionalEntityManager.save(ChildIssue, records);
              this.logger.debug('SequentialIds updated successfully');
            }
          }

          // Perform the soft delete of the issue
          this.logger.debug('Soft deleting the child issue with id:', id);
          await transactionalEntityManager.softDelete(ChildIssue, id);
          this.logger.debug('Child issue deleted successfully');
        },
      );
      await this.activityLogService.logActivity([
        {
          adminId: admin.id,
          action: ActivityEnum.DELETED,
          details: JSON.stringify(issue),
          placement: issue.parentIssue.placement,
        },
      ]);
      return new SuccessResponse(AppStrings.ISSUE_DELETED_SUCCESSFULLY);
    } catch (error) {
      this.logger.error('Failed to delete child issue:', error);
      throw new BadRequestException(error);
    }
  }
}
