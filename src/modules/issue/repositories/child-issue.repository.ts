/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';
import { ChildIssue } from '../../../entities';

@Injectable()
export class ChildIssueRepository extends Repository<ChildIssue> {
  constructor(private dataSource: DataSource) {
    super(ChildIssue, dataSource.createEntityManager());
  }
}
