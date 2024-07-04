/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { BadRequestException, Injectable } from '@nestjs/common';
import { IssueCategoryRepository, IssueRepository } from '../repositories';
import { Issue, IssueCategory } from 'src/entities';
import {
  CreateIssueCategoryInput,
  UpdateIssueCategoryInput,
  DeleteIssueInput,
} from '../dtos';
import { AppStrings } from 'src/common/messages/app.strings';

@Injectable()
export class IssueService {
  constructor(
    private readonly issueCategoryRepository: IssueCategoryRepository,
    private readonly issueRepository: IssueRepository,
  ) {}

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
   *
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
    if (category.issues && category.issues.length > 0) {
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
  async findAllIssues(): Promise<Issue[]> {
    return await this.issueRepository.findAll();
  }

  /**
   * Create Issue
   *
   * @async
   * @param {CreateIssueInput} input
   * @returns {Promise<Issue>}
   */
  // Async createIssue(input: CreateIssueInput): Promise<Issue> {
  //   Const category = await this.issueCategoryRepository.findByIdOrFail(
  //     Input.categoryId,
  //   );
  //   Const data: Partial<Issue> = {
  //     Message: input.issue,
  //     Category,
  //   };
  //   Return await this.issueRepository.create(data);
  // }

  /**
   * Update Issue
   *
   * @async
   * @param {UpdateIssueInput} input
   * @returns {Promise<Issue>}
   */
  // Async updateIssue(input: UpdateIssueInput): Promise<Issue> {
  //   Const category = await this.issueCategoryRepository.findByIdOrFail(
  //     Input.categoryId,
  //   );
  //   Const data: Partial<Issue> = {
  //     Message: input.issue,
  //     Category,
  //   };
  //   Return await this.issueRepository.update(input.id, data);
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
