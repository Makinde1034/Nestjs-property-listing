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
  AuctionActionInput,
  CreateAuctionInput,
  CreateAuctionParticipantInput,
  FetchAuctionParticipantInput,
  UpdateAuctionInput,
} from '../dtos/request/auction-input';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';
import { AuctionParticipantRepository } from '../repositories/auction-participant.repository';
import { AppStrings } from '../../../common/messages/app.strings';

import { removeDaysFromDate } from '../../../common/utils/helper';
import { BidsRepository } from '../repositories/bids.repository';
import {
  BidRegistrationInput,
  CreateBidInput,
  FindBidInput,
} from '../dtos/request/bids';
import { generateOtp } from '../../../common/utils/functions';
import { User } from '../../../entities';
import { AdminService } from '../../admin/services/admin.service';
import { Between, In } from 'typeorm';
import { AutoBidRepository } from '../repositories/auto-bid.repository';
import { SuccessResponse } from '../../../common/utils/success.response';
import { CreateAutoBidInput } from '../dtos/request/auto-bid';
import { ListingRepository } from '../repositories/listing.repository';

import { AuctionBidRangeRepository } from '../repositories/auction-bid-range.repository';
import { AuctionBidRange } from '../../../entities/auction-bid-range.entity';
import { StorageService } from '../../file-handler/services/storage.service';
import { ActivityEnum } from '../../../common/enums/activitys';
import { ActivityLogService } from '../../activity-log/services/activity-log.service';
import { AuctionEnum } from '../../../common/enums/status.enum';
import { AdminAuctionFilter } from '../dtos/request';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  differenceInCalendarDays,
  addHours,
  parseISO,
} from 'date-fns';

import { MessageEvent } from '../../sse/request/app';

import { AuctionParticipant } from '../../../entities/auction-participant.entity';
import { AuctionParticipantResponse } from '../dtos/response/listing.response';
import { SseService } from '../../sse/client.service';
import { ServerSentEvents } from '../../../common/enums';
import { BidRegistrationRepository } from '../repositories/bid-registration.repository';
import { Auction } from '../../../entities/auction-table.entity';
import { InvoiceRepository } from '../../payment/repositories/invoice.repository';

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

    private readonly bidRegistrationRepository: BidRegistrationRepository,

    private readonly sseService: SseService,
    private readonly invoiceRepository: InvoiceRepository,
  ) {}
  logger = new Logger(AuctionService.name);
  async create(auctionInput: CreateAuctionInput) {
    try {
      // Ensure start date is not in the past
      if (auctionInput.startDate < new Date()) {
        throw new BadRequestException(
          AppStrings.START_DATE_CANNOT_BE_LESS_THAN_DATE_0F_CREATION,
        );
      }

      // Ensure auction live time is between 4 and 24 hours
      if (auctionInput.liveFor > 24 || auctionInput.liveFor < 4) {
        throw new BadRequestException(
          AppStrings.AUCTION_DURATION_IS_BETWEEN_4_TO_24_HOURS,
        );
      }

      // Convert start date to UTC format
      const parsedStartDate = auctionInput.startDate;

      // Calculate expire date
      const expireAt = addHours(parsedStartDate, auctionInput.liveFor);

      // Save auction to the database
      return await this.auctionRepository.save({
        ...auctionInput,
        startDate: parsedStartDate,
        expireAt: expireAt,
      });
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async findOne(id: string) {
    try {
      const result = await this.auctionRepository.findOneOrFail({
        where: { id },
      });
      return result;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(AppStrings.AUCTION_NOT_FOUND);
    }
  }

  async findOneAuctionWithParticipants(
    paginateAndSort: FetchAuctionParticipantInput,
  ): Promise<AuctionParticipantResponse> {
    try {
      const { id, skip = 0, take = 20 } = paginateAndSort;
      //Default pagination if not provided

      const [auction, [participants, total]] = await Promise.all([
        // Fetch the auction details
        this.auctionRepository.findOneOrFail({
          where: { id },
        }),

        // Fetch participants with their bids, including userId for each bid
        this.auctionParticipantRepository
          .createQueryBuilder('auctionParticipant')
          .leftJoinAndSelect(
            'auctionParticipant.bid',
            'bids',
            'bids.price = (SELECT MAX(b.price) FROM Bids b WHERE b."auctionParticipantId" = auctionParticipant.id)',
          )
          .leftJoinAndSelect('auctionParticipant.listing', 'listing')
          .leftJoinAndSelect('listing.listingAttributes', 'listingAttributes')
          .leftJoinAndSelect('listingAttributes.attribute', 'attribute')
          .leftJoinAndSelect('listing.listingType', 'listingType')
          .leftJoinAndSelect('listing.gpsCoordinate', 'gpsCoordinate')
          .where('auctionParticipant.auctionId = :id', { id })
          .skip(skip)
          .take(take)
          .getManyAndCount(),
      ]);

      // Transform the data to include userId array within the participant object
      const transformedParticipants = participants.map((participant) => ({
        ...participant,
        userId: participant.bid // Collect userId from bids
          .map((bid) => bid.userId)
          .filter((userId) => userId), // Exclude null/undefined values
      }));

      return { auctions: auction, participant: transformedParticipants, total };
    } catch (error) {
      this.logger.error('Error fetching auction with participants:', error);
      if (error.name === 'EntityNotFound') {
        throw new BadRequestException(AppStrings.AUCTION_NOT_FOUND);
      }
      throw new BadRequestException(
        error.message || 'Error fetching auction data',
      );
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
      const nowUTC = new Date().toISOString();
      const [auctions, total] = await this.auctionRepository
        .createQueryBuilder('auction')
        .where('auction.startDate <= :date') // Running auctions
        .andWhere('auction.expireAt > :date') // Not expired
        .andWhere('auction.status = :statusOne', {
          statusOne: AuctionEnum.ACTIVE,
          date: nowUTC,
        })
        .loadRelationCountAndMap(
          'auction.auctionParticipantCount',
          'auction.auctionParticipant', // Relation to count
          'auctionParticipant',
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

  async findAll(paginateAndSort: AdminAuctionFilter) {
    try {
      const { sortField, directionToSort, where } = paginateAndSort;
      const sortDirection: 'ASC' | 'DESC' = directionToSort as 'ASC' | 'DESC';
      let whereOption = {};
      const now = new Date();
      const dateField = 'createdAt';

      // Default pagination if not provided
      if (!paginateAndSort.take || !paginateAndSort.skip) {
        paginateAndSort.skip = 0;
        paginateAndSort.take = 20;
      }

      switch (paginateAndSort.timePeriod) {
        case 'today':
          whereOption[dateField] = Between(startOfDay(now), endOfDay(now));
          break;
        case 'week':
          whereOption[dateField] = Between(startOfWeek(now), endOfWeek(now));
          break;
        case 'month':
          whereOption[dateField] = Between(startOfMonth(now), endOfMonth(now));
          break;
        case 'year':
          whereOption[dateField] = Between(startOfYear(now), endOfYear(now));
          break;
      }

      if (where) {
        whereOption = `auction.${where.fieldToChose} = :whereParam`;
      }

      const [auctions, total] = await this.auctionRepository
        .createQueryBuilder('auction')
        .loadRelationCountAndMap(
          'auction.auctionParticipantCount',
          'auction.auctionParticipant', // Relation to count
          'auctionParticipant',
        )
        .take(paginateAndSort.take)
        .skip(paginateAndSort.skip)
        .where(whereOption, { whereParam: where?.whereParam })
        .orderBy(
          sortField ? `auction.${sortField}` : 'auction.createdAt',
          sortDirection || 'DESC',
          'NULLS LAST',
        )
        .getManyAndCount();

      return { auctions, total };
    } catch (error) {
      this.logger.error(error.message || error);
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

      const startDateThreshold = new Date();
      startDateThreshold.setDate(
        startDateThreshold.getDate() -
          adminDefault.daysToAuctionRegistrationStart,
      );

      const [auctions, total] = await this.auctionRepository
        .createQueryBuilder('auction')
        .leftJoin('auction.auctionParticipant', 'auctionParticipant')
        .leftJoin('auctionParticipant.listing', 'listing')
        .select([
          'auction.id',
          'auction.titleInEnglish',
          'auction.titleInArabic',
          'auction.arabicDescription',
          'auction.englishDescription',
          'auction.startDate',
          'auction.liveFor',
          'auction.imageLink',
          'auction.status',
          'auction.expireAt',
          'auction.createdAt',
          'auction.maxListing',
          'auctionParticipant.id',
          'listing.id',
          'listing.images',
        ])
        .loadRelationCountAndMap(
          'auction.auctionParticipantCount',
          'auction.auctionParticipant', // Relation to count
        )

        .where(
          `CURRENT_DATE < auction.startDate 
           AND auction.status = :status`,
          {
            status: AuctionEnum.ACTIVE,
            startDateThreshold,
          },
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

      if (auction.startDate >= new Date()) {
        throw new BadRequestException(
          AppStrings.CANNOT_EDIT_AUCTION_ONCE_IT_HAS_STARTED,
        );
      }

      if (updateAuctionInput.startDate < new Date()) {
        throw new BadRequestException(
          AppStrings.START_DATE_CANNOT_BE_LESS_THAN_DATE_0F_CREATION,
        );
      }

      if (!auction.imageLink) {
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

      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }

  async cancleAuction(auctionActionInput: AuctionActionInput, user: User) {
    try {
      const unableToUpdate = [];
      const update = [];
      const auction = await this.auctionRepository.find({
        where: { id: In(auctionActionInput.id) },
      });

      auction.forEach((element) => {
        if (element.startDate > new Date()) {
          unableToUpdate.push(element);
        } else {
          update.push(element);
        }
      });

      const auctionsToUpdate = update.map((element) => {
        const { status, ...rest } = element;
        return {
          status: AuctionEnum.CANCELED,
          ...rest,
        };
      });

      const updated = await this.auctionRepository.save(auctionsToUpdate);

      const activityToSave = updated.map((element) => {
        return {
          adminId: user.id,
          action: ActivityEnum.UPDATED,

          details: JSON.stringify(auction.find((a) => a.id === element.id)),

          auctionId: element.id,
        };
      });

      await this.activityLogsService.logActivity(activityToSave);

      return new SuccessResponse(AppStrings.SUCCESSFULL, {
        unableToUpdate: { ...unableToUpdate },
      });
    } catch (error) {
      this.logger.log(error);

      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }

  async reactivateAuction(auctionActionInput: AuctionActionInput, user: User) {
    try {
      const auction = await this.auctionRepository.find({
        where: { id: In(auctionActionInput.id) },
      });

      const unableToUpdate = [];
      const update: Auction[] = [];

      auction.forEach((element) => {
        if (element.startDate > new Date()) {
          unableToUpdate.push(element);
        } else {
          update.push(element);
        }
      });

      const auctionsToUpdate = update.map((element) => {
        const { status, ...rest } = element;
        return {
          status: AuctionEnum.ACTIVE,
          ...rest,
        };
      });

      const updated = await this.auctionRepository.save(auctionsToUpdate);
      if (updated) {
        const activityToSave = updated.map((element) => {
          return {
            adminId: user.id,
            action: ActivityEnum.UPDATED,
            auctionId: element.id,
            details: JSON.stringify(auction.find((a) => a.id === element.id)),
          };
        });

        await this.activityLogsService.logActivity(activityToSave);
        return new SuccessResponse(AppStrings.SUCCESSFULL, {
          unableToUpdate: { ...unableToUpdate },
        });
      }
    } catch (error) {
      this.logger.log(error);

      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }

  async addListingToAuction(data: CreateAuctionParticipantInput) {
    try {
      const { auctionId, listingId, ...listingData } = data;

      const [adminDefault, auction, participantCount, listing] =
        await Promise.all([
          this.adminService.adminDefault(),
          this.auctionRepository.findOneBy({ id: auctionId }),
          this.auctionParticipantRepository
            .createQueryBuilder('auctionParticipant')
            .where(
              'auctionParticipant.listingId = :listingId AND auctionParticipant.auctionId = :auctionId',
              { auctionId, listingId: data.listingId },
            )
            .getCount(),

          this.listingRepository.findOneBy({ id: listingId }),
        ]);

      // Validate required entities
      if (!adminDefault) {
        throw new BadRequestException('Admin settings not found');
      }

      if (!auction) {
        throw new BadRequestException('Auction not found');
      }

      if (!listing) {
        throw new BadRequestException('Listing not found');
      }

      if (participantCount > 0) {
        throw new BadRequestException(
          'Listing has already been added to this auction',
        );
      }

      if (!auction.imageLink) {
        throw new BadRequestException(
          AppStrings.AUCTION_IS_NOT_COMPLETELY_SET_UP,
        );
      }

      // Validate registration period
      const now = new Date();

      const differenceInDays = differenceInCalendarDays(now, auction.startDate);
      const registrationStart = removeDaysFromDate(
        now,
        adminDefault.daysToAuctionRegistrationStart,
      );
      const registrationEnd = removeDaysFromDate(
        now,
        adminDefault.daysToAuctionRegistrationEnd,
      );

      if (auction.startDate <= new Date(registrationStart)) {
        throw new BadRequestException(
          AppStrings.AUCTION_REGISTRATION_HAS_NOT_STARTED,
        );
      }
      if (differenceInDays > adminDefault.daysToAuctionRegistrationStart) {
        throw new BadRequestException(
          AppStrings.AUCTION_REGISTRATION_HAS_NOT_STARTED,
        );
      }

      if (new Date(registrationEnd) >= auction.startDate) {
        throw new BadRequestException(AppStrings.AUCTION_REGISTATION_HAS_ENDED);
      }

      // Save the participant
      return await this.auctionParticipantRepository.save({
        ...listingData,
        auctionId,
        listing,
      });
    } catch (error) {
      this.logger.error('Failed to add listing to auction', error.stack);

      // Re-throw known exceptions
      if (error instanceof HttpException) {
        throw error;
      }

      // Handle unexpected errors
      throw new BadRequestException('An unexpected error occurred');
    }
  }

  async getParticipantOfAuction(paginateAndSort: PaginateAndSort) {
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
        .leftJoinAndSelect('auctionParticipant.bid', 'bids')
        .loadRelationCountAndMap(
          'auctionParticipant.bidCount', // Mapping the bid count to `bidCount`
          'auctionParticipant.bid', // Relation to count
          'bids',
        )
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

  async delete(auctionActionInput: AuctionActionInput, user: User) {
    try {
      const unableToUpdate = [];
      const update = [];
      const auction = await this.auctionRepository.find({
        where: {
          id: In(auctionActionInput.id),
        },
      });

      auction.forEach((element) => {
        if (element.startDate > new Date()) {
          unableToUpdate.push(element);
        } else {
          update.push(element);
        }
      });

      const deleteAuction = await this.auctionRepository.softDelete(update);

      if (deleteAuction.affected >= 0) {
        const activityToSave = auctionActionInput.id.map((element) => {
          return {
            adminId: user.id,
            action: ActivityEnum.UPDATED,
            auctionId: element,
          };
        });

        await this.activityLogsService.logActivity(activityToSave);
        return new SuccessResponse(AppStrings.SUCCESSFULL, {
          unableToUpdate: { ...unableToUpdate },
        });
      }
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  /**************
   * Bids
   **************/
  async bidOnAuction(bidInput: CreateBidInput, user: User) {
    try {
      // Fetch necessary details concurrently

      const [
        auctionParticipant,
        auctionBidRanges,
        highestBid,
        bidRegistrationRepository,
      ] = await Promise.all([
        this.auctionParticipantRepository.findOne({
          where: { listingId: bidInput.listingId },
        }),

        this.auctionBidRangeRepository.find(),
        this.bidRepository.findOne({
          where: {
            listingId: bidInput.listingId,
            auctionId: bidInput.auctionId,
          },
          order: { price: 'DESC' },
        }),

        this.bidRegistrationRepository.findOne({
          where: { userId: user.id, auctionId: bidInput.auctionId },
        }),
      ]);

      if (!auctionParticipant) {
        throw new NotFoundException('Listing not registered in auction');
      }

      if (!bidRegistrationRepository) {
        throw new NotFoundException(
          'you have not registered  to bid for this auction',
        );
      }

      if (auctionParticipant.startingPrice > bidInput.price) {
        throw new NotFoundException(
          ` Minimum open bid price is ${auctionParticipant.startingPrice}`,
        );
      }
      // Determine appropriate increment based on bid price range
      const increment = auctionBidRanges.find(
        (range) =>
          bidInput.price / 1000000 >= range.lowerBound &&
          bidInput.price / 1000000 <= range.upperBound,
      )?.increment;

      const incrementValue =
        increment * 1000 ||
        (await this.adminService.adminDefault()).fallBackDefaultBidIncrement;

      // Validate minimum bid price
      if (highestBid && bidInput?.price < highestBid?.price) {
        throw new BadRequestException(
          `MInimum bid must be more ${Math.floor(highestBid.price + incrementValue)}`,
        );
      }

      // Check minimum increment requirement if a previous highest bid exists
      if (highestBid && bidInput.price < highestBid.price + incrementValue) {
        throw new BadRequestException(`Minimum increment is ${incrementValue}`);
      }

      // Prepare and save the new bid
      bidInput.bidNumber = generateOtp();
      bidInput.userId = user.id;

      const bid = await this.bidRepository.save({
        ...bidInput,
        auctionParticipant,
      });

      // Trigger autobid if bid was successfully placed
      if (bid) {
        await this.autobid(bid.price, auctionParticipant, bidInput);
      }

      const payload: MessageEvent = {
        type: ServerSentEvents.SUCCESS,
        data: bid,
      };

      this.sseService.sendEvent(user.id, payload, auctionParticipant.id);

      return bid;
    } catch (error) {
      this.logger.debug(error);
      throw error instanceof HttpException
        ? error
        : new BadRequestException(error);
    }
  }
  async createAutoBidOnAuction(
    createAutoBidInput: CreateAutoBidInput,
    user: User,
  ) {
    try {
      const { reference, ...rest } = createAutoBidInput;
      //TODO: add payment check
      const [auction, listing] = await Promise.all([
        this.auctionRepository.findOneBy({ id: createAutoBidInput.auctionId }),
        this.listingRepository.findOneBy({ id: createAutoBidInput.listingId }),
      ]);

      if (!listing) {
        throw new NotFoundException(AppStrings.NOT_FOUND);
      }
      if (!auction) {
        throw new NotFoundException(AppStrings.NOT_FOUND);
      }

      const autoBid = await this.autoBidRepository.save({
        ...rest,
        userId: user.id,
      });

      return autoBid;
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

  async autobid(
    price: number,
    auctionParticipant: AuctionParticipant,
    bidInput: CreateBidInput,
  ) {
    try {
      const valueInRange = Math.floor(price / 1000000);
      const adminDefault = await this.adminService.adminDefault();

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

      const bidsToMake = autoBids.map((element) => {
        return {
          auctionparticipantId: auctionParticipant,

          listingId: bidInput.listingId,
          auctionId: bidInput.auctionId,
          bidNumber: generateOtp(),
          userId: element.userId,
          autoBid: true,
          price:
            this.calculatebidPrice(price, auctionBidRange) ??
            adminDefault.fallBackDefaultBidIncrement,
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

        .orWhere('auction.titleInArabic ILIKE :term', {
          term: `%${searchParam}%`,
        })
        .orWhere('auction.titleInArabic ILIKE :term', {
          term: `%${searchParam}%`,
        })

        .take(10)
        .getMany();
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async bidRange() {
    try {
      const data = await this.auctionBidRangeRepository
        .createQueryBuilder('AuctionBidRange')
        .getMany();

      return data;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async uploadAuctionImage(id: string, file: Express.Multer.File[]) {
    try {
      const listing = await this.auctionRepository.findOne({ where: { id } });
      if (!listing) {
        throw new BadRequestException('Auction not found');
      }
      // Upload the new files
      const uploadedUrl = await this.storageService.upload(file[0]);

      // Save the updated images to the database
      await this.auctionRepository.update(id, {
        imageLink: uploadedUrl,
        status: AuctionEnum.ACTIVE,
      });
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

  async registerToBid(data: BidRegistrationInput, user: User) {
    try {
      const [auction, listing, adminDefault, invoice] = await Promise.all([
        this.auctionRepository.findOneBy({ id: data.auctionId }),
        this.listingRepository.findOneBy({ id: data.listingId }),
        this.adminService.adminDefault(),
        this.invoiceRepository.findOne({
          where: { reference: data.reference },
        }),
      ]);

      const now = new Date();

      if (!auction) {
        throw new BadRequestException('Auction not Found');
      }

      if (!invoice) {
        throw new BadRequestException('Invalid invoice reference');
      }

      if (!listing) {
        throw new BadRequestException('Listing not Found');
      }

      const differenceInDays = differenceInCalendarDays(auction.startDate, now);

      if (differenceInDays < adminDefault.daysToAuctionRegistrationStart) {
        throw new BadRequestException('Bid registration has ended');
      }

      return await this.bidRegistrationRepository.save({
        ...data,
        userId: user.id,
      });
    } catch (error) {
      this.logger.log(error);

      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }
}
