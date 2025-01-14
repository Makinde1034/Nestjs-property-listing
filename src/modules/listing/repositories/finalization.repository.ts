/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Finalization } from '../../../entities/finalization.entity';

@Injectable()
export class FinalizationRepository extends Repository<Finalization> {
  constructor(private readonly dataSource: DataSource) {
    super(Finalization, dataSource.createEntityManager());
  }
}
