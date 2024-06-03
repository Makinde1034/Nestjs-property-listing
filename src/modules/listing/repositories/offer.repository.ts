/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { InjectRepository } from '@nestjs/typeorm';
import { Offer } from '../../../entities/offer.entity';
import { Repository } from 'typeorm';
import { EntityRepository } from '../../core/base.class/entity.repository';
import { Injectable } from '@nestjs/common';
@Injectable()
export class OfferRepository extends EntityRepository<Offer> {
  constructor(
    @InjectRepository(Offer)
    private readonly repository: Repository<Offer>,
  ) {
    super(repository);
  }
}
