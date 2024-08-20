/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import { Ticket } from '../../../entities';

import { DataSource, Repository } from 'typeorm';

@Injectable()
export class TicketRepository extends Repository<Ticket> {
  constructor(private dataSource: DataSource) {
    super(Ticket, dataSource.createEntityManager());
  }
}
