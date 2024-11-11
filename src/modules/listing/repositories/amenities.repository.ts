/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { Amenities } from '../../../entities/amenities.entity';

@Injectable()
export class AmenitiesRepository extends Repository<Amenities> {
  constructor(private readonly dataSource: DataSource) {
    super(Amenities, dataSource.createEntityManager());
  }
}
