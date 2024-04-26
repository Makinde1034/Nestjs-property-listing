/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import { Attribute } from '../../../entities';
import { EntityRepository } from '../../core/base.class/entity.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AttributeRepository extends EntityRepository<Attribute> {
  constructor(
    @InjectRepository(Attribute)
    private readonly repository: Repository<Attribute>,
  ) {
    super(repository);
  }
}
