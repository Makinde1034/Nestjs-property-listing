/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { GeneralLedger } from '../../../entities/general-ledger.entity';

@Injectable()
export class TransactionRepository extends Repository<GeneralLedger> {
  constructor(private readonly dataSource: DataSource) {
    super(GeneralLedger, dataSource.createEntityManager());
  }
}
