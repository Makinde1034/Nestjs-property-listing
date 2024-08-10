/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import { EntityRepository } from '../../core/base.class/entity.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParentIssue } from '../../../entities';

@Injectable()
export class IssueRepository extends EntityRepository<ParentIssue> {
  constructor(
    @InjectRepository(ParentIssue)
    private readonly repository: Repository<ParentIssue>,
  ) {
    super(repository);
  }
}
