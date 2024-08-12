/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { IssueCategoryRepository, IssueRepository } from '../repositories';
import { ChildIssue, IssueCategory, ParentIssue } from 'src/entities';
import {
  CreateIssueCategoryInput,
  UpdateIssueCategoryInput,
  DeleteIssueInput,
  CreateIssueInput,
  UpdateIssueInput,
} from '../dtos';
import { AppStrings } from 'src/common/messages/app.strings';
import { ChildIssueRepository } from '../repositories/child-issue.repository';
import { MoreThan } from 'typeorm';

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
  async updateCategory(data: UpdateIssueCategoryInput): Promise<IssueCategory> {
    return await this.issueCategoryRepository.update(data.id, data);
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
  async createIssue(input: CreateIssueInput): Promise<ParentIssue> {
    try {
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

      return await this.issueRepository.save(data);
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
  async updateParentIssue(input: UpdateIssueInput): Promise<ParentIssue> {
    const data: Partial<ParentIssue> = {
      ...input,
    };
    const result = await this.issueRepository.update(input.id, data);

    if (result.affected > 0) {
      return await this.issueRepository.findOneBy({ id: input.id });
    }

    if (input.sequentialId) {
      const records = await this.issueRepository.find({
        order: { sequentialId: 'ASC' },
        where: {
          sequentialId: MoreThan(input.sequentialId),
        },
      });
      let newValue = input.sequentialId;

      // Update the value of each record
      const updatedRecords = records.map((record) => {
        newValue = newValue + 1;
        record.sequentialId = newValue;
        return record;
      });

      // Save the updated records back to the database
      await this.issueRepository.save(updatedRecords);
    }
  }

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
