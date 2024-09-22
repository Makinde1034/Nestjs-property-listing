/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { GpsCoordinate } from '../../../entities/gps-coordinates.entity';
@Injectable()
export class GpsCoordinateRepository extends Repository<GpsCoordinate> {
  constructor(private dataSource: DataSource) {
    super(GpsCoordinate, dataSource.createEntityManager());
  }
}
