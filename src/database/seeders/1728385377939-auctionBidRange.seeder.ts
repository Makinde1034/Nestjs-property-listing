/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { AuctionBidRange } from '../../entities/auction-bid-range.entity';
import { AuctionBidRangeFactory } from '../factories/auction-bid-range.factory';

export class AuctionBidRange1728385377939 implements Seeder {
  track = false;

  logger = new Logger(AuctionBidRange1728385377939.name);

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    this.logger.debug(
      `${AuctionBidRange1728385377939.name}....`,
      factoryManager,
    );

    const repository = dataSource.getRepository(AuctionBidRange);

    const auctionBidRange = await repository.find();

    if (auctionBidRange.length > 0) {
      this.logger.debug(
        `Seeding for: ${AuctionBidRange1728385377939.name} Already completed`,
      );
    } else {
      await repository.save(AuctionBidRangeFactory as Partial<AuctionBidRange>);
    }
    this.logger.debug(
      `Seeding for: ${AuctionBidRange1728385377939.name} finished`,
    );
  }
}
