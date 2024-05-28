/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Repository } from 'typeorm';
import { EntityRepository } from '../../core/base.class/entity.repository';
import { CityEntitity } from '../../../entities/city.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
@Injectable()
export class CityRepository extends EntityRepository<CityEntitity> {
  constructor(
    @InjectRepository(CityEntitity)
    private readonly repository: Repository<CityEntitity>,
  ) {
    super(repository);
  }
}
