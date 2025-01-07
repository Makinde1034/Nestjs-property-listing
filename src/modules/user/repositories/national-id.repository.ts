/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import { NationalIdentity } from '../../../entities';

import { DataSource, Repository } from 'typeorm';

@Injectable()
export class NationalIdentityRepository extends Repository<NationalIdentity> {
  constructor(private readonly dataSource: DataSource) {
    super(NationalIdentity, dataSource.createEntityManager());
  }
}
