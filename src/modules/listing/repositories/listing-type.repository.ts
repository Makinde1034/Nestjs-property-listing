/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import { ListingType } from '../../../entities';
import { EntityRepository } from '../../core/base.class/entity.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ListingTypeRepository extends EntityRepository<ListingType> {
  constructor(
    @InjectRepository(ListingType)
    private readonly repository: Repository<ListingType>,
  ) {
    super(repository);
  }
}
