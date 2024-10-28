/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
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

import { removeDaysFromDate } from '../../../common/utils/helper';
import { BidsRepository } from '../repositories/bids.repository';
import { CreateBidInput, FindBidInput } from '../dtos/request/bids';
import { generateOtp } from '../../../common/utils/functions';
import { User } from '../../../entities';
import { AdminService } from '../../admin/services/admin.service';
import { QueryFailedError } from 'typeorm';
import { AutoBidRepository } from '../repositories/auto-bid.repository';
import { SuccessResponse } from '../../../common/utils/success.response';
import { CreateAutoBidInput } from '../dtos/request/auto-bid';
import { ListingRepository } from '../repositories/listing.repository';

import { AuctionBidRangeRepository } from '../repositories/auction-bid-range.repository';
import { AuctionBidRange } from '../../../entities/auction-bid-range.entity';
import { StorageService } from '../../file-handler/services/storage.service';
import { ActivityEnum } from '../../../common/enums/activitys';
import { ActivityLogService } from '../../activity-log/services/activity-log.service';

@Injectable()
export class AuctionService {
  constructor(
    private readonly auctionRepository: AuctionRepository,
    private readonly auctionParticipantRepository: AuctionParticipantRepository,
    private readonly adminService: AdminService,
    private readonly bidRepository: BidsRepository,
    private readonly listingRepository: ListingRepository,
    private readonly auctionBidRangeRepository: AuctionBidRangeRepository,
    private readonly autoBidRepository: AutoBidRepository,
    private readonly storageService: StorageService,
    private readonly activityLogsService: ActivityLogService,
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

  async findAllRunning(paginateAndSort: PaginateAndSort) {
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
        .where(`CURRENT_DATE > auction.startDate and auction.deletedAt IS NULL`)
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

  async findAllUpcoming(paginateAndSort: PaginateAndSort) {
    try {
      const { sortField, directionToSort } = paginateAndSort;
      const sortDirection: 'ASC' | 'DESC' = directionToSort as 'ASC' | 'DESC';

      const adminDefault = await this.adminService.adminDefault();

      // Default pagination if not provided
      if (!paginateAndSort.take || !paginateAndSort.skip) {
        paginateAndSort.skip = 0;
        paginateAndSort.take = 20;
      }

      const [auctions, total] = await this.auctionRepository
        .createQueryBuilder('auction')

        .where(
          `CURRENT_DATE < auction.startDate AND CURRENT_DATE > CURRENT_DATE - INTERVAL '${adminDefault.daysToAuctionRegistrationStart} days'`,
        )
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

  async update(updateAuctionInput: UpdateAuctionInput, user: User) {
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
      if (update.affected > 0) {
        const result = await this.auctionRepository.findOne({
          where: {
            id: id,
          },
        });
        await this.activityLogsService.logActivity([
          {
            adminId: user.id,
            action: ActivityEnum.UPDATED,

            details: JSON.stringify(auction),

            auctionId: result.id,
          },
        ]);
        return result;
      }
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async addListingToAuction(data: CreateAuctionParticipantInput) {
    try {
      const adminDefault = await this.adminService.adminDefault();

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
          removeDaysFromDate(date, adminDefault.daysToAuctionRegistrationStart),
        )
      ) {
        throw new BadRequestException(
          AppStrings.AUCTION_REGISTRATION_HAS_NOT_STARTED,
        );
      }
      if (
        new Date(
          removeDaysFromDate(date, adminDefault.daysToAuctionRegistrationEnd),
        ) >= auction.startDate
      ) {
        throw new BadRequestException(AppStrings.AUCTION_REGISTATION_HAS_ENDED);
      }
      return await this.auctionParticipantRepository.save({ ...data, auction });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else if (
        error instanceof QueryFailedError &&
        error.driverError.code === '23505'
      ) {
        throw new BadRequestException(' Listing has been added to auction');
      } else {
        this.logger.log(error);
        throw new BadRequestException(error);
      }
    }
  }

  async getPaticipantOfAuction(paginateAndSort: PaginateAndSort) {
    try {
      const { sortField, directionToSort } = paginateAndSort;
      const sortDirection: 'ASC' | 'DESC' = directionToSort as 'ASC' | 'DESC';

      // Default pagination if not provided
      if (!paginateAndSort.take || !paginateAndSort.skip) {
        paginateAndSort.skip = 0;
        paginateAndSort.take = 20;
      }

      const [listing, total] = await this.auctionParticipantRepository
        .createQueryBuilder('auctionParticipant')
        .leftJoinAndSelect('auctionParticipant.listing', 'listing')
        .leftJoinAndSelect('listing.listingAttributes', 'listingAttributes')
        .leftJoinAndSelect('listingAttributes.attribute', 'attribute')

        .take(paginateAndSort.take)
        .skip(paginateAndSort.skip)
        .orderBy(
          sortField
            ? `auctionParticipant.${sortField}`
            : 'auctionParticipant.createdAt',
          sortDirection || 'DESC',
          'NULLS LAST',
        )
        .getManyAndCount();

      return { listing, total };
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error.message || 'Error fetching auctions');
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

  /***************
   * Bids
   ***************/
  async bidOnAuction(bidInput: CreateBidInput, user: User) {
    try {
      const auctionListing = await this.auctionParticipantRepository.findOne({
        where: { listingId: bidInput.listingId },
      });

      if (!auctionListing) {
        throw new NotFoundException('Listing not registered in auction');
      }

      if (bidInput.price < auctionListing.minimumPrice) {
        throw new BadRequestException('Bid is too low');
      }

      bidInput.bidNumber = generateOtp();
      bidInput.userId = user.id;
      const bid = await this.bidRepository.save(bidInput);

      if (bid) {
        await this.autobid(bid.price, bidInput);
      }
      return bid;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        this.logger.log(error);
        throw new BadRequestException(error);
      }
    }
  }

  async createAutoBidOnAuction(
    createAutoBidInput: CreateAutoBidInput,
    user: User,
  ) {
    try {
      //TODO: add payment check
      const [auction, listing] = await Promise.all([
        this.findOne(createAutoBidInput.auctionId),
        this.listingRepository.findOneBy({ id: createAutoBidInput.listingId }),
      ]);

      if (!listing) {
        throw new NotFoundException(AppStrings.NOT_FOUND);
      }

      if (!auction) {
        throw new NotFoundException(AppStrings.NOT_FOUND);
      }

      const autoBid = await this.autoBidRepository.save({
        ...createAutoBidInput,
        userId: user.id,
      });

      if (autoBid) {
        return autoBid;
      }
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        this.logger.log(error);
        throw new BadRequestException(error);
      }
    }
  }

  async autobid(price: number, bidInput: CreateBidInput) {
    try {
      const valueInRange = Math.floor(price / 1000000);

      const [autoBids, auctionBidRange] = await Promise.all([
        this.autoBidRepository.find({
          where: {
            auctionId: bidInput.auctionId,
            listingId: bidInput.listingId,
          },
        }),
        this.auctionBidRangeRepository
          .createQueryBuilder('auctionBidRange')
          .where(
            'auctionBidRange.lowerBound <= :valueInRange AND auctionBidRange.upperBound >= :valueInRange',
            { valueInRange },
          )
          .getOne(),
      ]);

      const bidsToMake: CreateBidInput[] = autoBids.map((element) => {
        return {
          listingId: bidInput.listingId,
          auctionId: bidInput.auctionId,
          bidNumber: generateOtp(),
          userId: element.userId,
          price: this.calculatebidPrice(price, auctionBidRange),
        };
      });

      await this.bidRepository.save(bidsToMake);
      return new SuccessResponse(AppStrings.SUCCESSFULL);
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        this.logger.log(error);
        throw new BadRequestException(error);
      }
    }
  }

  /***
   * Calculate the new price to bid based on system's default increment
   */

  calculatebidPrice(bidPrice: number, auctionBidRange: AuctionBidRange) {
    const newBidPrice = bidPrice + auctionBidRange.increment * 1000;
    return newBidPrice;
  }

  async fetchBidsOnAuction(findBidInput: FindBidInput) {
    try {
      return await this.bidRepository.find({
        where: {
          auctionId: findBidInput.auctionId,
          listingId: findBidInput.listingId,
        },
        order: { createdAt: 'DESC' },
        take: 10,
        skip: 0,
      });
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async searchForAuction(searchParam: string) {
    try {
      return await this.auctionRepository
        .createQueryBuilder('auction')

        .orWhere('auction.titleInArabic LIKE :term', {
          term: `%${searchParam}%`,
        })
        .orWhere('auction.titleInArabic LIKE :term', {
          term: `%${searchParam}%`,
        })

        .take(10)
        .getMany();
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async uploadAuctionImage(id: string, file: Express.Multer.File) {
    try {
      const listing = await this.auctionRepository.findOne({ where: { id } });
      if (!listing) {
        throw new BadRequestException('Auction not found');
      }
      // Upload the new files
      const uploadedUrl = await this.storageService.upload(file);

      // Save the updated images to the database
      await this.auctionRepository.update(id, { imageLink: uploadedUrl });
      return new SuccessResponse(AppStrings.UPLOAD_SUCCESSFUL, uploadedUrl);
    } catch (error) {
      this.logger.error('Error during  image upload', error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(
          error.message || 'An unexpected error occurred during image upload',
        );
      }
    }
  }
}
