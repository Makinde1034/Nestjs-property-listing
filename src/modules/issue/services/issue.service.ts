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
import { Between, EntityManager, MoreThanOrEqual } from 'typeorm';
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
      const { sequentialId, ...data } = payload;

      // Check if a workflow is configured for the ParentIssue entity
      const actionConfigPromise =
        this.workflowService.findOneWorkflowByDocumentname(
          this.issueRepository.metadata.name,
        );

      // Directly calculate the sequential ID if needed
      const totalIssuesPromise = sequentialId
        ? null
        : this.issueRepository.count();

      const [actionConfig, totalIssues] = await Promise.all([
        actionConfigPromise,
        totalIssuesPromise,
      ]);
      const approval = actionConfig?.approvalTwoRole.length > 0 ? 2 : 1; //if approval role 2 has an id the it requires  two approvals

      // If a workflow is configured, submit the action for approval
      if (actionConfig) {
        const issue = this.issueRepository.create(payload);
        await this.actionService.createActionRequest(
          {
            document: this.issueRepository.metadata.name,
            actionType: 'create',
            targetEntityId: null, // No specific entity yet for a new parent issue
            user: admin,
            payload: JSON.stringify(issue),
          },
          admin,
          approval,
        );

        return new SuccessResponse('Action is awaiting approval', issue);
      }

      // Calculate the final sequential ID
      const finalSequentialId = sequentialId ?? totalIssues + 1;

      if (sequentialId) {
        // Rearrange existing sequential IDs
        await this.issueRepository
          .createQueryBuilder()
          .update()
          .set({ sequentialId: () => 'sequentialId + 1' })
          .where('sequentialId >= :sequentialId', { sequentialId })
          .execute();
      }

      // Save the new issue
      const parentIssue = await this.issueRepository.save({
        ...data,
        sequentialId: finalSequentialId,
      });

      // Log activity
      await this.activityLogService.logActivity([
        {
          adminId: admin.id,
          action: ActivityEnum.CREATED,
          details: JSON.stringify(parentIssue),
          placement: parentIssue.placement,
        },
      ]);

      return new SuccessResponse(AppStrings.SUCCESSFULL, parentIssue);
    } catch (error) {
      this.logger.error('Failed to create parent issue', error.stack);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new UnprocessableEntityException(
        'An error occurred while creating the parent issue',
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
    updateParentIssueInput: UpdateIssueInput,
    admin: User,
  ): Promise<SuccessResponse> {
    try {
      const { id, sequentialId, ...rest } = updateParentIssueInput;

      // Fetch the parent issue and workflow configuration in parallel
      const [parentIssue, actionConfig] = await Promise.all([
        this.issueRepository.findOne({
          where: { id },
          select: ['id', 'sequentialId', 'placement'], // Fetch only necessary fields
        }),
        this.workflowService.findOneWorkflowByDocumentname(
          this.issueRepository.metadata.name,
        ),
      ]);

      if (!parentIssue) {
        throw new BadRequestException('Parent Issue not found');
      }
      const approval = actionConfig?.approvalTwoRole.length > 0 ? 2 : 1; //if approval role 2 has an id the it requires  two approvals

      // Handle workflow-based approval
      if (actionConfig) {
        await this.actionService.createActionRequest(
          {
            document: this.issueRepository.metadata.name,
            actionType: 'update',
            targetEntityId: id.toString(),
            user: admin,
            payload: JSON.stringify(updateParentIssueInput),
          },
          admin,
          approval,
        );

        return new SuccessResponse('Action is awaiting approval');
      }

      // Rearrange sequential IDs if necessary
      if (sequentialId && sequentialId !== parentIssue.sequentialId) {
        const queryBuilder = this.issueRepository.createQueryBuilder();
        if (sequentialId > parentIssue.sequentialId) {
          await queryBuilder
            .update()
            .set({ sequentialId: () => 'sequentialId - 1' })
            .where('sequentialId BETWEEN :current AND :target', {
              current: parentIssue.sequentialId + 1,
              target: sequentialId,
            })
            .execute();
        } else {
          await queryBuilder
            .update()
            .set({ sequentialId: () => 'sequentialId + 1' })
            .where('sequentialId BETWEEN :target AND :current', {
              target: sequentialId,
              current: parentIssue.sequentialId - 1,
            })
            .execute();
        }
      }

      // Update the parent issue
      const updateResult = await this.issueRepository.update(id, {
        ...rest,
        sequentialId: sequentialId ?? parentIssue.sequentialId,
      });

      if (updateResult.affected > 0) {
        // Log activity for the update
        await this.activityLogService.logActivity([
          {
            adminId: admin.id,
            action: ActivityEnum.UPDATED,
            details: JSON.stringify({ id, ...rest }),
            placement: parentIssue.placement,
          },
        ]);

        return new SuccessResponse(AppStrings.SUCCESSFULL, {
          id,
          ...rest,
          sequentialId: sequentialId ?? parentIssue.sequentialId,
        });
      }

      throw new UnprocessableEntityException('Update operation failed');
    } catch (error) {
      this.logger.error('Failed to update parent issue', error.stack);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new UnprocessableEntityException(
        'An error occurred while updating the parent issue',
      );
    }
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
  ): Promise<SuccessResponse> {
    try {
      const { parentId, sequentialId, ...data } = payload;

      // Check if the parent issue exists
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
      const approval = actionConfig?.approvalTwoRole.length > 0 ? 2 : 1; //if approval role 2 has an id the it requires  two approvals
      // If a workflow is configured, submit the action for approval
      if (actionConfig) {
        await this.actionService.createActionRequest(
          {
            document: this.childIssueRepository.metadata.name,
            actionType: 'create',
            targetEntityId: parentId.toString(),
            user: admin,
            payload: JSON.stringify(payload),
          },
          admin,
          approval,
        );

        return new SuccessResponse('Action is awaiting approval');
      }

      // Direct creation logic if no workflow exists
      if (sequentialId) {
        // If sequentialId is provided, rearrange existing sequential IDs
        await this.childIssueRepository.increment(
          { sequentialId: MoreThanOrEqual(sequentialId) },
          'sequentialId',
          1,
        );
      }

      const finalSequentialId =
        sequentialId ??
        (await this.childIssueRepository.count({ where: { parentIssue } })) + 1;

      const childIssue = await this.childIssueRepository.save({
        ...data,
        parentIssue,
        sequentialId: finalSequentialId,
      });

      // Log activity
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

  async updateChildIssue(
    updateChildIssueInput: UpdateChildIssueInput,
    admin: User,
  ): Promise<SuccessResponse> {
    try {
      const { id, sequentialId, ...rest } = updateChildIssueInput;
      // Find the existing child issue with only required fields
      const childIssue = await this.childIssueRepository
        .createQueryBuilder('childIssue')
        .where('id = :id', { id })
        .getOne();

      // select: ['id', 'sequentialId', 'parentIssueId'], // Fetch only necessary fields

      if (!childIssue) {
        throw new BadRequestException('Child Issue not found');
      }

      // Check if a workflow is configured for the ChildIssue entity
      const actionConfig =
        await this.workflowService.findOneWorkflowByDocumentname(
          this.childIssueRepository.metadata.name,
        );
      const approval = actionConfig?.approvalTwoRole.length > 0 ? 2 : 1; //if approval role 2 has an id the it requires  two approvals

      if (actionConfig) {
        // Submit action for approval
        await this.actionService.createActionRequest(
          {
            document: this.childIssueRepository.metadata.name,
            actionType: 'update',
            targetEntityId: id,
            user: admin,
            payload: JSON.stringify(updateChildIssueInput),
          },
          admin,
          approval,
        );

        return new SuccessResponse('Action is awaiting approval');
      }

      // Rearrange sequential IDs if necessary
      if (sequentialId && sequentialId !== childIssue.sequentialId) {
        const parentIssueId = childIssue.parentIssueId; // Use direct parent ID for filtering

        if (sequentialId > childIssue.sequentialId) {
          // Decrement sequential IDs for issues between the current and new position
          await this.childIssueRepository
            .createQueryBuilder()
            .update()
            .set({ sequentialId: () => 'sequentialId - 1' })
            .where('sequentialId > :current AND sequentialId <= :new', {
              current: childIssue.sequentialId,
              new: sequentialId,
            })
            .andWhere('parentIssueId = :parentId', { parentId: parentIssueId })
            .execute();
        } else {
          // Increment sequential IDs for issues between the new and current position
          await this.childIssueRepository
            .createQueryBuilder()
            .update()
            .set({ sequentialId: () => 'sequentialId + 1' })
            .where('sequentialId >= :new AND sequentialId < :current', {
              current: childIssue.sequentialId,
              new: sequentialId,
            })
            .andWhere('parentIssueId = :parentId', { parentId: parentIssueId })
            .execute();
        }
      }

      // Update the child issue with minimal data fetch
      const { affected } = await this.childIssueRepository.update(id, {
        ...rest,
        sequentialId: sequentialId ?? childIssue.sequentialId,
      });

      if (affected > 0) {
        // Retrieve the updated issue for logging
        const updatedIssue = await this.childIssueRepository.findOneOrFail({
          where: { id },
          relations: ['parentIssue'], // Only fetch relations after update
        });

        // Log activity
        await this.activityLogService.logActivity([
          {
            adminId: admin.id,
            action: ActivityEnum.UPDATED,
            details: JSON.stringify(updatedIssue),
            placement: updatedIssue.parentIssue?.placement,
          },
        ]);

        return new SuccessResponse(AppStrings.SUCCESSFULL, updatedIssue);
      }
    } catch (error) {
      this.logger.error('Failed to update child issue', error);

      if (error instanceof HttpException) {
        throw error;
      }
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
