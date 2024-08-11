/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';
import { ParentIssue } from '../../../entities';

@Injectable()
export class IssueRepository extends Repository<ParentIssue> {
  constructor(private dataSource: DataSource) {
    super(ParentIssue, dataSource.createEntityManager());
  }
}
