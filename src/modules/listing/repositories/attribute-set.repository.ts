/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import { AttributeSet } from '../../../entities';
import { EntityRepository } from '../../core/base.class/entity.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AttributeSetRepository extends EntityRepository<AttributeSet> {
  constructor(
    @InjectRepository(AttributeSet)
    private readonly repository: Repository<AttributeSet>,
  ) {
    super(repository);
  }
}
