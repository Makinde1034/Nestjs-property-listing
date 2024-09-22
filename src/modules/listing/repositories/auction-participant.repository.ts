/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { AuctionParticipant } from '../../../entities/auction-participant.entity';

@Injectable()
export class AuctionParticipantRepository extends Repository<AuctionParticipant> {
  constructor(private dataSource: DataSource) {
    super(AuctionParticipant, dataSource.createEntityManager());
  }
}
