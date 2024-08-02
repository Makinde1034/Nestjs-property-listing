/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AdminDefault } from '../../../entities/admin-table.entity';

@Injectable()
export class AdminRepository extends Repository<AdminDefault> {
  constructor(private dataSource: DataSource) {
    super(AdminDefault, dataSource.createEntityManager());
  }
}
