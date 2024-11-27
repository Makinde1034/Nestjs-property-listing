/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
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
import { Public } from '../../auth/decorators/permision.decorator';
import { PermissionsEnum } from '../../../common/enums/permission.enum';

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
  @Permissions(PermissionsEnum.ISSUES_CATEGORIES_CREATE)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async createIssue(
    @Args('input') RequestInput: CreateIssueInput,
    @Context() ctx: any,
  ): Promise<ParentIssue> {
    return await this.issueService.createIssue(RequestInput, ctx.req.user);
  }

  /**
   * Update Issue
   * @async
   * @param {UpdateIssueInput} RequestInput
   * @returns {Promise<Issue>}
   */
  @Mutation(() => ParentIssue)
  @Permissions(PermissionsEnum.ISSUES_CATEGORIES_READ)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async updateIssue(
    @Args('RequestInput') RequestInput: UpdateIssueInput,

    @Context() ctx: any,
  ): Promise<ParentIssue> {
    return await this.issueService.updateIssue(RequestInput, ctx.user.req);
  }

  /**
   * Fetch Issues
   *
   * @async
   * @returns {Promise<Issue[]>}
   */

  @Query(() => [ParentIssue])
  @UseGuards(AccessTokenGuard)
  @Public()
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
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.ISSUES_CATEGORIES_DELETE)
  async deleteIssue(@Args('id') id: string, @Context() ctx: any) {
    return await this.issueService.deleteIssue(id, ctx.req.user);
  }

  @Mutation(() => ParentIssue)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.ISSUES_CATEGORIES_CREATE)
  async createChildIssue(
    @Args('input') input: CreateChildIssueInput,
    @Context() ctx: any,
  ): Promise<ChildIssue> {
    return await this.issueService.createChildIssue(input, ctx.req.user);
  }

  @Mutation(() => ParentIssue)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.ISSUES_CATEGORIES_CREATE)
  async updateChildIssue(
    @Args('RequestInput') RequestInput: UpdateIssueInput,
    @Context() ctx: any,
  ): Promise<ChildIssue> {
    return await this.issueService.updateChildIssue(RequestInput, ctx.req.user);
  }

  @Query(() => [ChildIssue])
  @UseGuards(AccessTokenGuard)
  @Public()
  async fetchChildIssues(
    @Args('parentId') parentId: string,
  ): Promise<ChildIssue[]> {
    return await this.issueService.findAllChildIssues(parentId);
  }
  @Mutation(() => SuccessResponse)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.ISSUES_CATEGORIES_DELETE)
  async deleteChildIssue(@Args('id') id: string, @Context() ctx: any) {
    return await this.issueService.deleteChildIssue(id, ctx.req.user);
  }
}
