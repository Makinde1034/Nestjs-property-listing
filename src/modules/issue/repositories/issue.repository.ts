/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import { Issue } from '../../../entities';
import { EntityRepository } from '../../core/base.class/entity.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class IssueRepository extends EntityRepository<Issue> {
  constructor(
    @InjectRepository(Issue)
    private readonly repository: Repository<Issue>,
  ) {
    super(repository);
  }
}
