/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TransactionLog } from '../../../entities/transaction-log.entity';
@Injectable()
export class TransactionRepository extends Repository<TransactionLog> {
  constructor(private readonly dataSource: DataSource) {
    super(TransactionLog, dataSource.createEntityManager());
  }
}
