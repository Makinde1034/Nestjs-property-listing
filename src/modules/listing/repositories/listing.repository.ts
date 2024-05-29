/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import { Listing } from '../../../entities';
import { EntityRepository } from '../../core/base.class/entity.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ListingRepository extends EntityRepository<Listing> {
  constructor(
    @InjectRepository(Listing)
    private readonly repository: Repository<Listing>,
  ) {
    super(repository);
  }
}
