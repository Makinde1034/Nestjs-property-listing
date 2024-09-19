/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { ChildIssue, ParentIssue } from 'src/entities';
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

@Injectable()
export class IssueService {
  constructor(
    private readonly issueRepository: IssueRepository,
    private readonly childIssueRepository: ChildIssueRepository,
  ) {}

  logger = new Logger(IssueService.name);

  /**
   * Create Issue
   * @async
   * @param {CreateIssueInput} payload
   * @returns {Promise<Issue>}
   */
  async createIssue(payload: CreateIssueInput): Promise<ParentIssue> {
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
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async findAllIssuesByPlacement(placement: string): Promise<ParentIssue[]> {
    try {
      console.log('here');

      if (placement) {
        return await this.issueRepository.find({
          where: { placement: placement },
          order: { sequentialId: 'ASC' },
          relations: ['childIssue'],
        });
      }
      return await this.issueRepository.find({
        order: { sequentialId: 'ASC' },
        relations: ['childIssue'],
      });
    } catch (error) {
      console.log(error);
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

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
  }

  /**
   * Delete issue
   *
   * @async
   * @param {String} id
   * @returns {Promise<string>}
   */
  async deleteIssue(id: string) {
    const issue = await this.issueRepository.findOneBy({ id });

    if (!issue) {
      throw new BadRequestException(AppStrings.NOT_FOUND);
    }

    await this.issueRepository.softDelete(id);

    const { sequentialId, placement } = issue;

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

  async createChildIssue(payload: CreateChildIssueInput): Promise<ChildIssue> {
    const { parentId, ...data } = payload;
    const parentIssue = await this.issueRepository.findOneByOrFail({
      id: parentId,
    });
    if (!parentIssue) {
      throw new BadRequestException('Parent Issue not found');
    }
    return await this.childIssueRepository.save({ ...data, parentIssue });
  }

  async updateChildIssue(updateChildissue: UpdateChildIssueInput) {
    try {
      const { id, ...rest } = updateChildissue;

      const childIssueCount = await this.childIssueRepository.count();
      rest.sequentialId = childIssueCount + 1;

      const { affected } = await this.childIssueRepository.update(id, rest);

      if (affected > 0) {
        return this.childIssueRepository.findOneByOrFail({ id });
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

  async deleteChildIssue(id: string) {
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
      return new SuccessResponse(AppStrings.ISSUE_DELETED_SUCCESSFULLY);
    } catch (error) {
      this.logger.error('Failed to delete child issue:', error);
      throw new BadRequestException(error);
    }
  }
}
