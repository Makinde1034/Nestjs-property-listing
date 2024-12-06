/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';

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
import { ActionService } from '../../admin/services/action.service';
import { AdminWorkflowService } from '../../admin/services/admin-workflow.service';

@Injectable()
export class IssueService {
  constructor(
    private readonly issueRepository: IssueRepository,
    private readonly childIssueRepository: ChildIssueRepository,
    private readonly activityLogService: ActivityLogService,
    private readonly actionService: ActionService,
    private readonly workflowService: AdminWorkflowService,
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
  ): Promise<SuccessResponse> {
    try {
      const { sequentialId, ...input } = payload;

      if (sequentialId !== undefined && sequentialId <= 0) {
        throw new BadRequestException('SequentialId must be greater than 0');
      }

      // Fetch action configuration for issues
      const actionConfig =
        await this.workflowService.findOneWorkflowByDocumentname(
          this.issueRepository.metadata.tableName,
        );

      const count = await this.issueRepository.count({
        where: { placement: input.placement },
      });

      const issueData: Partial<ParentIssue> = {
        englishName: input.englishName,
        arabicName: input.arabicName,
        sequentialId: count,
        placement: input.placement,
      };

      // If workflow exists, create an action request
      if (actionConfig) {
        await this.actionService.createActionRequest(
          {
            document: this.issueRepository.metadata.tableName,
            actionType: 'create',
            targetEntityId: null,
            user: admin,
            payload: JSON.stringify(issueData),
          },
          admin,
        );

        return new SuccessResponse('Awaiting action approval');
      }

      // Proceed with creating the issue directly
      const data = await this.issueRepository.manager.transaction(
        async (manager) => {
          const createdIssue = await manager.save(
            this.issueRepository.create(issueData),
          );

          if (sequentialId !== undefined) {
            await manager.update(
              ParentIssue,
              {
                placement: createdIssue.placement,
                sequentialId: MoreThanOrEqual(sequentialId),
              },
              { sequentialId: () => 'sequentialId + 1' },
            );

            await manager.update(ParentIssue, createdIssue.id, {
              sequentialId,
            });
          }

          await this.activityLogService.logActivity([
            {
              adminId: admin.id,
              action: ActivityEnum.CREATED,
              details: JSON.stringify(issueData),
              placement: issueData.placement,
            },
          ]);

          return createdIssue;
        },
      );

      return new SuccessResponse(AppStrings.SUCCESSFULL, data);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(
        error.message || 'An error occurred while creating the issue',
      );
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
  ): Promise<SuccessResponse> {
    const { id, sequentialId, ...data } = input;

    if (sequentialId !== undefined && sequentialId <= 0) {
      throw new BadRequestException('SequentialId must be greater than 0');
    }

    // Fetch action configuration and validate issue existence
    const [actionConfig, issue] = await Promise.all([
      this.workflowService.findOneWorkflowByDocumentname(
        this.issueRepository.metadata.tableName,
      ),
      this.issueRepository.findOneByOrFail({ id }),
    ]);

    if (!issue) {
      throw new BadRequestException('Issue not found');
    }

    const updatedIssueData: Partial<ParentIssue> = {
      ...issue,
      ...data,
    };

    // If workflow exists, create an action request
    if (actionConfig) {
      await this.actionService.createActionRequest(
        {
          document: this.issueRepository.metadata.tableName,
          actionType: 'update',
          targetEntityId: id,
          user: admin,
          payload: JSON.stringify(updatedIssueData),
        },
        admin,
      );

      return new SuccessResponse('Awaiting action approval');
    }

    // Proceed with updating the issue directly
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

    // Log activity after update
    await this.activityLogService.logActivity([
      {
        adminId: admin.id,
        action: ActivityEnum.UPDATED,
        details: JSON.stringify(data),
        placement: issue.placement,
      },
    ]);

    return new SuccessResponse(AppStrings.SUCCESSFULL, result);
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

  // async createChildIssue(
  //   payload: CreateChildIssueInput,
  //   admin: User,
  // ): Promise<ChildIssue> {
  //   const { parentId, ...data } = payload;
  //   const parentIssue = await this.issueRepository.findOneByOrFail({
  //     id: parentId,
  //   });
  //   if (!parentIssue) {
  //     throw new BadRequestException('Parent Issue not found');
  //   }
  //   const childIssue = await this.childIssueRepository.save({
  //     ...data,
  //     parentIssue,
  //   });

  //   await this.activityLogService.logActivity([
  //     {
  //       adminId: admin.id,
  //       action: ActivityEnum.CREATED,
  //       details: JSON.stringify(childIssue),
  //       placement: childIssue.parentIssue.placement,
  //     },
  //   ]);

  //   return childIssue;
  // }

  async createChildIssue(
    payload: CreateChildIssueInput,
    admin: User,
  ): Promise<SuccessResponse> {
    try {
      const { parentId, ...data } = payload;

      // Validate the parent issue
      const parentIssue = await this.issueRepository.findOneByOrFail({
        id: parentId,
      });
      if (!parentIssue) {
        throw new BadRequestException('Parent Issue not found');
      }

      // Check if a workflow is configured for the ChildIssue entity
      const actionConfig =
        await this.workflowService.findOneWorkflowByDocumentname(
          this.childIssueRepository.metadata.name,
        );

      if (actionConfig) {
        // Submit the action for workflow approval
        await this.actionService.createActionRequest(
          {
            document: this.childIssueRepository.metadata.tableName,
            actionType: 'create',
            targetEntityId: null, // New entities don't have IDs yet
            user: admin,
            payload: JSON.stringify({ ...data, parentId }),
          },
          admin,
        );

        return new SuccessResponse('Action is awaiting approval');
      }

      // If no workflow is configured, create the child issue directly
      const childIssue = await this.childIssueRepository.save({
        ...data,
        parentIssue,
      });

      // Log the activity for this action
      await this.activityLogService.logActivity([
        {
          adminId: admin.id,
          action: ActivityEnum.CREATED,
          details: JSON.stringify(childIssue),
          placement: childIssue.parentIssue.placement,
        },
      ]);

      return new SuccessResponse(AppStrings.SUCCESSFULL, childIssue);
    } catch (error) {
      this.logger.error('Failed to create child issue', error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new UnprocessableEntityException(
        'An error occurred while creating the child issue',
      );
    }
  }

  // async updateChildIssue(updateChildissue: UpdateChildIssueInput, admin: User) {
  //   try {
  //     const { id, ...rest } = updateChildissue;
  //     const childIssue = await this.childIssueRepository.findOneBy({
  //       id,
  //     });

  //     if (!childIssue) {
  //       throw new BadRequestException(AppStrings.NOT_FOUND);
  //     }
  //     const childIssueCount = await this.childIssueRepository.count();
  //     rest.sequentialId = childIssueCount + 1;

  //     const { affected } = await this.childIssueRepository.update(id, rest);

  //     if (affected > 0) {
  //       await this.activityLogService.logActivity([
  //         {
  //           adminId: admin.id,
  //           action: ActivityEnum.UPDATED,
  //           details: JSON.stringify(childIssue),
  //           placement: childIssue.parentIssue.placement,
  //         },
  //       ]);
  //       return await this.childIssueRepository.findOneByOrFail({ id });
  //     }
  //   } catch (error) {
  //     this.logger.log(error);

  //     throw new BadRequestException(error);
  //   }
  // }

  async updateChildIssue(
    updateChildIssueInput: UpdateChildIssueInput,
    admin: User,
  ): Promise<SuccessResponse> {
    try {
      const { id, ...rest } = updateChildIssueInput;

      // Check if the child issue exists
      const childIssue = await this.childIssueRepository.findOne({
        where: { id },
        relations: ['parentIssue'],
      });

      if (!childIssue) {
        throw new BadRequestException(AppStrings.NOT_FOUND);
      }

      // Check if a workflow is configured for the ChildIssue entity
      const actionConfig =
        await this.workflowService.findOneWorkflowByDocumentname(
          this.childIssueRepository.metadata.name,
        );

      if (actionConfig) {
        // Submit the update action for workflow approval
        await this.actionService.createActionRequest(
          {
            document: this.childIssueRepository.metadata.name,
            actionType: 'update',
            targetEntityId: id.toString(),
            user: admin,
            payload: JSON.stringify(rest),
          },
          admin,
        );

        return new SuccessResponse('Action is awaiting approval');
      }

      // If no workflow is configured, proceed with the update directly
      const childIssueCount = await this.childIssueRepository.count();
      rest.sequentialId = childIssueCount + 1;

      const { affected } = await this.childIssueRepository.update(id, rest);

      if (affected > 0) {
        // Log the update activity
        await this.activityLogService.logActivity([
          {
            adminId: admin.id,
            action: ActivityEnum.UPDATED,
            details: JSON.stringify({ ...childIssue, ...rest }),
            placement: childIssue.parentIssue.placement,
          },
        ]);

        // Fetch and return the updated child issue
        const data = await this.childIssueRepository.findOneByOrFail({ id });

        return new SuccessResponse(AppStrings.SUCCESSFULL, data);
      }

      throw new BadRequestException('Update failed');
    } catch (error) {
      this.logger.error('Failed to update child issue', error.stack);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new UnprocessableEntityException(
        'An error occurred while updating the child issue',
      );
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
