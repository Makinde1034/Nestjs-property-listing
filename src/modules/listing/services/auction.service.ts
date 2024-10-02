/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AuctionRepository } from '../repositories/auction.repository';
import {
  CreateAuctionInput,
  CreateAuctionParticipantInput,
  UpdateAuctionInput,
} from '../dtos/request/auction-input';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';
import { AuctionParticipantRepository } from '../repositories/auction-participant.repository';
import { AppStrings } from '../../../common/messages/app.strings';
import { AdminRepository } from '../../admin/repositories/admin.repository';
import { removeDaysFromDate } from '../../../common/utils/helper';

@Injectable()
export class AuctionService {
  constructor(
    private auctionRepository: AuctionRepository,
    private auctionParticipantRepository: AuctionParticipantRepository,
    private adminRepository: AdminRepository,
  ) {}
  logger = new Logger(AuctionService.name);
  async create(auctionInput: CreateAuctionInput) {
    try {
      if (auctionInput.startDate < new Date()) {
        throw new BadRequestException(
          AppStrings.START_DATE_CANNOT_BE_LESS_THAN_DATE_0F_CREATION,
        );
      }

      if (auctionInput.liveFor > 24 || auctionInput.liveFor < 4) {
        throw new BadRequestException(
          AppStrings.AUCTION_DURATION_IS_BETWEEN_4_TO_24_HOURS,
        );
      }

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
      throw new BadRequestException(AppStrings.AUCTION_NOT_FOUND);
    }
  }

  async findAll(paginateAndSort: PaginateAndSort) {
    try {
      const { sortField, directionToSort } = paginateAndSort;
      const sortDirection: 'ASC' | 'DESC' = directionToSort as 'ASC' | 'DESC';

      // Default pagination if not provided
      if (!paginateAndSort.take || !paginateAndSort.skip) {
        paginateAndSort.skip = 0;
        paginateAndSort.take = 20;
      }

      const [auctions, total] = await this.auctionRepository
        .createQueryBuilder('auction')
        .where("CURRENT_DATE < auction.startDate - INTERVAL '3 days'")
        .take(paginateAndSort.take)
        .skip(paginateAndSort.skip)
        .orderBy(
          sortField ? `auction.${sortField}` : 'auction.createdAt',
          sortDirection || 'DESC',
          'NULLS LAST',
        )
        .getManyAndCount();

      return { auctions, total };
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error.message || 'Error fetching auctions');
    }
  }

  async update(updateAuctionInput: UpdateAuctionInput) {
    try {
      const { id, ...rest } = updateAuctionInput;

      const auction = await this.auctionRepository.findOne({
        where: { id: id },
      });

      if (auction.startDate > new Date()) {
        throw new BadRequestException(
          AppStrings.CANNOT_EDIT_AUCTION_ONCE_IT_HAS_STARTED,
        );
      }

      if (updateAuctionInput.startDate < new Date()) {
        throw new BadRequestException(
          AppStrings.START_DATE_CANNOT_BE_LESS_THAN_DATE_0F_CREATION,
        );
      }

      if (!updateAuctionInput.imageLink) {
        throw new BadRequestException(
          AppStrings.AUCTION_IS_NOT_COMPLETELY_SET_UP,
        );
      }
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

  async addListingToAuction(data: CreateAuctionParticipantInput) {
    try {
      const adminDefault = await this.adminRepository.find();

      const auction = await this.findOne(data.auctionId);

      if (!auction.imageLink) {
        throw new BadRequestException(
          AppStrings.AUCTION_IS_NOT_COMPLETELY_SET_UP,
        );
      }
      const date = new Date();
      if (
        auction.startDate <=
        new Date(
          removeDaysFromDate(
            date,
            adminDefault[0].daysToAuctionRegistrationStart,
          ),
        )
      ) {
        throw new BadRequestException(
          AppStrings.AUCTION_REGISTRATION_HAS_NOT_STARTED,
        );
      }
      if (
        new Date(
          removeDaysFromDate(
            date,
            adminDefault[0].daysToAuctionRegistrationEnd,
          ),
        ) >= auction.startDate
      ) {
        throw new BadRequestException(AppStrings.AUCTION_REGISTATION_HAS_ENDED);
      }
      return await this.auctionParticipantRepository.save(data);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        this.logger.log(error);
        throw new BadRequestException(error);
      }
    }
  }

  async delete(id: string) {
    try {
      const deleteAuction = await this.auctionRepository.softDelete(id);
      return deleteAuction;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }
}
