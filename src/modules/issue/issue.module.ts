/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Module } from '@nestjs/common';
import { IssueResolver } from './resolvers';
import { IssueService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentIssue, IssueCategory, ChildIssue } from 'src/entities';
import { IssueCategoryRepository, IssueRepository } from './repositories';
import { ChildIssueRepository } from './repositories/child-issue.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ParentIssue, IssueCategory, ChildIssue])],
  providers: [
    IssueResolver,
    IssueService,
    IssueRepository,
    IssueCategoryRepository,
    ChildIssueRepository,
  ],
  exports: [IssueRepository, IssueCategoryRepository, ChildIssueRepository],
})
export class IssueModule {}
