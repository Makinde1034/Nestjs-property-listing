/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard, PermissionsGuard } from '../../auth/guards';
import {
  CreateIssueCategoryInput,
  CreateIssueInput,
  DeleteIssueInput,
  UpdateIssueCategoryInput,
  UpdateIssueInput,
} from '../dtos';
import { Issue, IssueCategory } from '../../../entities';
import { IssueService } from '../services';
import { Permissions } from 'src/common/decorator/permission';

@Resolver()
export class IssueResolver {
  constructor(private readonly issueService: IssueService) {}

  /**
   * Fetch Issue categories
   *
   * @async
   * @returns {Promise<IssueCategory[]>}
   */
  @Query(() => [IssueCategory])
  @Permissions('create-issues-categories')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async fetchIssueCategories(): Promise<IssueCategory[]> {
    return await this.issueService.findAllIssueCategories();
  }

  /**
   * Create Issue category
   *
   * @async
   * @param {IssueCategory} RequestInput
   * @returns {Promise<IssueCategory>}
   */
  @Mutation(() => IssueCategory)
  @Permissions('create-issues-categories')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async createIssueCategory(
    @Args('RequestInput') RequestInput: CreateIssueCategoryInput,
  ): Promise<IssueCategory> {
    return await this.issueService.createCategory(RequestInput);
  }

  /**
   * Update Issue Catgeory
   *
   * @async
   * @param {UpdateIssueCategoryInput} RequestInput
   * @returns {Promise<IssueCatgeory>}
   */
  @Mutation(() => IssueCategory)
  @Permissions('update-issues-categories')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async updateIssueCatgeory(
    @Args('RequestInput') RequestInput: UpdateIssueCategoryInput,
  ): Promise<IssueCategory> {
    return await this.issueService.updateCategory(RequestInput);
  }

  /**
   * Delete Issue Category
   *
   * @async
   * @param {DeleteIssueInput} RequestInput
   * @returns {Promise<string>}
   */
  @Mutation(() => String)
  @Permissions('delete-issues-categories')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async deleteIssueCategory(
    @Args('RequestInput') RequestInput: DeleteIssueInput,
  ): Promise<string> {
    return await this.issueService.deleteCategory(RequestInput);
  }

  /**
   * Fetch Issues
   *
   * @async
   * @returns {Promise<Issue[]>}
   */
  @Query(() => [Issue])
  @Permissions('read-issues-categories')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async fetchIssues(): Promise<Issue[]> {
    return await this.issueService.findAllIssues();
  }

  /**
   * Create Issue
   *
   * @async
   * @param {CreateIssueInput} RequestInput
   * @returns {Promise<Issue>}
   */
  @Mutation(() => Issue)
  @Permissions('create-issues-categories')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async createIssue(
    @Args('RequestInput') RequestInput: CreateIssueInput,
  ): Promise<Issue> {
    return await this.issueService.createIssue(RequestInput);
  }

  /**
   * Update Issue
   *
   * @async
   * @param {UpdateIssueInput} RequestInput
   * @returns {Promise<Issue>}
   */
  @Mutation(() => Issue)
  @Permissions('update-issues-categories')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async updateIssue(
    @Args('RequestInput') RequestInput: UpdateIssueInput,
  ): Promise<Issue> {
    return await this.issueService.updateIssue(RequestInput);
  }

  /**
   * Delete Issue
   *
   * @async
   * @param {DeleteIssueInput} RequestInput
   * @returns {Promise<string>}
   */
  @Mutation(() => String)
  @Permissions('delete-issues-categories')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async deleteIssue(
    @Args('RequestInput') RequestInput: DeleteIssueInput,
  ): Promise<string> {
    return await this.issueService.deleteIssue(RequestInput);
  }
}
