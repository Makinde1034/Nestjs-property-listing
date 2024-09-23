/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Module } from '@nestjs/common';
import { IssueResolver } from './resolvers';
import { IssueService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentIssue, ChildIssue } from 'src/entities';

import { ChildIssueRepository } from './repositories/child-issue.repository';
import { IssueRepository } from './repositories';

@Module({
  imports: [TypeOrmModule.forFeature([ParentIssue, ChildIssue])],
  providers: [
    IssueResolver,
    IssueService,
    ParentIssue,
    IssueRepository,
    ChildIssueRepository,
  ],
  exports: [IssueRepository, ChildIssueRepository],
})
export class IssueModule {}
