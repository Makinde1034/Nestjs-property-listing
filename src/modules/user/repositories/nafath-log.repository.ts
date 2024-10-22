/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { NafathLog } from '../../../entities/nafath-logs.entity';

@Injectable()
export class NafathLogsRepository extends Repository<NafathLog> {
  constructor(private readonly dataSource: DataSource) {
    super(NafathLog, dataSource.createEntityManager());
  }
}
