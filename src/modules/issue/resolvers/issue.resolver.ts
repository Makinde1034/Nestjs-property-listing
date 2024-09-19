/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard, PermissionsGuard } from '../../auth/guards';
import {
  CreateChildIssueInput,
  CreateIssueInput,
  UpdateIssueInput,
} from '../dtos';
import { ChildIssue, ParentIssue } from '../../../entities';
import { IssueService } from '../services';
import { Permissions } from 'src/common/decorator/permission';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { SuccessResponse } from '../../../common/utils/success.response';

@Resolver()
export class IssueResolver {
  constructor(private readonly issueService: IssueService) {}

  /*********************************
   * Issues
   *********************************/
  /**
   * Create Issue
   *
   * @async
   * @param {CreateIssueInput} RequestInput
   * @returns {Promise<Issue>}
   */
  @Mutation(() => ParentIssue)
  @Permissions('create-issues-categories')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async createIssue(
    @Args('input') RequestInput: CreateIssueInput,
  ): Promise<ParentIssue> {
    return await this.issueService.createIssue(RequestInput);
  }

  /**
   * Update Issue
   * @async
   * @param {UpdateIssueInput} RequestInput
   * @returns {Promise<Issue>}
   */
  @Mutation(() => ParentIssue)
  @UseGuards(AccessTokenGuard, AdminGuard)
  async updateIssue(
    @Args('RequestInput') RequestInput: UpdateIssueInput,
  ): Promise<ParentIssue> {
    return await this.issueService.updateIssue(RequestInput);
  }

  /**
   * Fetch Issues
   *
   * @async
   * @returns {Promise<Issue[]>}
   */

  @Query(() => [ParentIssue])
  @UseGuards(AccessTokenGuard)
  async fetchIssues(
    @Args('placement', { nullable: true }) placement: string,
  ): Promise<ParentIssue[]> {
    return await this.issueService.findAllIssuesByPlacement(placement);
  }

  /**
   * Delete Issue
   *
   * @async
   * @param {String}
   * @returns {Promise<SuccessResponse>}
   */
  @Mutation(() => SuccessResponse)
  @Permissions('delete-issues-categories')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async deleteIssue(@Args('id') id: string) {
    return await this.issueService.deleteIssue(id);
  }

  @Mutation(() => ParentIssue)
  @Permissions('create-issues-categories')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async createChildIssue(
    @Args('input') input: CreateChildIssueInput,
  ): Promise<ChildIssue> {
    return await this.issueService.createChildIssue(input);
  }

  @Mutation(() => ParentIssue)
  @UseGuards(AccessTokenGuard, AdminGuard)
  async updateChildIssue(
    @Args('RequestInput') RequestInput: UpdateIssueInput,
  ): Promise<ChildIssue> {
    return await this.issueService.updateChildIssue(RequestInput);
  }

  @Query(() => [ChildIssue])
  @UseGuards(AccessTokenGuard)
  async fetchChildIssues(
    @Args('parentId') parentId: string,
  ): Promise<ChildIssue[]> {
    return await this.issueService.findAllChildIssues(parentId);
  }
  @Mutation(() => SuccessResponse)
  @Permissions('delete-issues-categories')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async deleteChildIssue(@Args('id') id: string) {
    return await this.issueService.deleteChildIssue(id);
  }
}
