/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource, Repository } from 'typeorm';
import { Place } from '../../../entities/place.entity';
import { Injectable } from '@nestjs/common';
@Injectable()
export class PlaceRepository extends Repository<Place> {
  constructor(private readonly dataSource: DataSource) {
    super(Place, dataSource.createEntityManager());
  }
}
