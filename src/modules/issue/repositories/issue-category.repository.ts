/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import { IssueCategory } from '../../../entities';
import { EntityRepository } from '../../core/base.class/entity.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class IssueCategoryRepository extends EntityRepository<IssueCategory> {
  constructor(
    @InjectRepository(IssueCategory)
    private readonly repository: Repository<IssueCategory>,
  ) {
    super(repository);
  }
}
