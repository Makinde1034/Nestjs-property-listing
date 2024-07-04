/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AuctionRepository } from '../repositories/auction.repository';
import {
  CreateAuctionInput,
  UpdateAuctionInput,
} from '../dtos/request/auction-input';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';

@Injectable()
export class AuctionService {
  constructor(private auctionRepository: AuctionRepository) {}
  logger = new Logger(AuctionService.name);
  async create(auctionInput: CreateAuctionInput) {
    try {
      return await this.auctionRepository.save(auctionInput);
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async findOne(id: string) {
    try {
      return await this.auctionRepository.findOneOrFail({ where: { id: id } });
    } catch (error) {
      this.logger.log(error);
    }
  }

  async findAll(paginateAndSort: PaginateAndSort) {
    try {
      const orderOptions = {
        [paginateAndSort.sortField]: paginateAndSort.directionToSort,
      };

      if (paginateAndSort.take && paginateAndSort.skip) {
        paginateAndSort.skip = 0;
        paginateAndSort.take = 20;
      }

      const [auction, total] = await this.auctionRepository.findAndCount({
        take: paginateAndSort.take,
        skip: paginateAndSort.skip,
        order: orderOptions,
      });

      return { auction, total };
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }
  async update(updateAuctionInput: UpdateAuctionInput) {
    try {
      const { id, ...rest } = updateAuctionInput;
      const update = await this.auctionRepository.update(id, rest);
      if (update.affected > 0)
        return await this.auctionRepository.findOne({
          where: {
            id: id,
          },
        });
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }
}
