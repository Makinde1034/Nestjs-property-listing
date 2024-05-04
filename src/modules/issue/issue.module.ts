/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Module } from '@nestjs/common';
import { IssueResolver } from './resolvers';
import { IssueService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issue, IssueCategory } from 'src/entities';
import { IssueCategoryRepository, IssueRepository } from './repositories';

@Module({
  imports: [TypeOrmModule.forFeature([Issue, IssueCategory])],
  providers: [
    IssueResolver,
    IssueService,
    IssueRepository,
    IssueCategoryRepository,
  ],
  exports: [IssueRepository, IssueCategoryRepository],
})
export class IssueModule {}
