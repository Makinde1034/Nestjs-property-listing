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
import { ListingRepository } from '../../listing/repositories/listing.repository';
import {
  ListingTypeRepository,
  OfferRepository,
} from '../../listing/repositories';

import { UserRepository } from '../../user/repositories';

import { UserTrackingRepository } from '../../user/repositories/user-tracking-repository';

import {
  startOfYear,
  endOfYear,
  subYears,
  endOfMonth,
  startOfMonth,
  subMonths,
  startOfDay,
  endOfDay,
  endOfWeek,
  startOfWeek,
  differenceInDays,
  subWeeks,
  addDays,
  format,
  addMonths,
  getMonth,
} from 'date-fns';

import { Between, Brackets, In, IsNull, Not } from 'typeorm';
import { OfferListEnum } from '../../../common/enums/status.enum';
import {
  SaiiFees,
  ListingStats,
  UserStats,
  UserFunneling,
  UserDemography,
  UserCity,
  UserCountryCount,
  UserGenderCount,
  UserAgeRange,
  FinancialVsOrderResponse,
  IsCouponValidResponse,
} from '../dto/response/admin-response';
import { TicketRepository } from '../../tickets/repositories';
import {
  AdminDashboardListingStatus,
  AdminDashboardSort,
  UpdateAdminDefaultInput,
} from '../dto/request/admin-request';
import { AdminRepository } from '../repositories/admin.repository';
import { CouponRepository } from '../repositories/coupons.repository';
import {
  CouponFilter,
  CreateCouponInput,
  DeactivateCouponInput,
  DeleteCouponInput,
  UpdateCouponInput,
  ValidataCouponInput,
} from '../dto/request/coupons';
import { Coupon } from '../../../entities/coupon.entity';

import { SuccessResponse } from '../../../common/utils/success.response';
import { AppStrings } from '../../../common/messages/app.strings';
import { CouponEnum } from '../../../common/enums/coupons.enum';
import { AuctionBidRangeRepository } from '../../listing/repositories/auction-bid-range.repository';
import { User } from '../../../entities';
import { AdminWorkflowService } from './admin-workflow.service';
import { ActionService } from './action.service';
import { TimePeriod } from '../../../common/enums/sort.enum';
import { TransactionRepository } from '../../payment/repository/transaction.repository';
import { InvoiceRepository } from '../../payment/repositories/invoice.repository';
import { SettingFeatureRepository } from '../repositories/feature-setting.repository';
import { SystemFeatureSettingInput } from '../dto/request/workflow';
import { ActivityLogService } from '../../activity-log/services/activity-log.service';
import { ActivityEnum } from '../../../common/enums/activitys';
import { AdminFilterAndSort } from '../../listing/dtos/request';
import { TicketStatus, UserLevelEnum } from '../../../common/enums';

import * as moment from 'moment';

@Injectable()
export class AdminService {
  constructor(
    private readonly listingRepository: ListingRepository,
    private readonly offerRepository: OfferRepository,
    private readonly userRepository: UserRepository,
    private readonly userTracking: UserTrackingRepository,
    private readonly ticketsRepository: TicketRepository,
    private readonly adminRepository: AdminRepository,
    private readonly couponRepository: CouponRepository,
    private readonly auctionBidRangeRepository: AuctionBidRangeRepository,

    private readonly workflowService: AdminWorkflowService,
    private readonly actionService: ActionService,
    private readonly listingTypeRepository: ListingTypeRepository,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly systemFeatureRepository: SettingFeatureRepository,

    private readonly activityLogService: ActivityLogService,
  ) {}

  logger = new Logger(AdminService.name);

  async updateSystemSetting(adminDefaultInput: UpdateAdminDefaultInput) {
    try {
      const adminDefault = await this.adminDefault();
      const { affected } = await this.adminRepository.update(
        adminDefault.id,
        adminDefaultInput,
      );
      if (affected > 0) {
        return await this.adminDefault();
      }
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }

  async updateAuctionBidRangeSetting(
    adminDefaultInput: UpdateAdminDefaultInput,
  ) {
    try {
      // Step 1: Create a lookup for the system feature settings by id
      const settingsMap = new Map(
        adminDefaultInput.bidRange.map((element) => [element.id, element]),
      );

      const ids = adminDefaultInput.bidRange.map((element) => element.id);

      // Step 2: Retrieve the features from the database
      const bidRange = await this.auctionBidRangeRepository.find({
        where: {
          id: In(ids),
        },
      });

      // Step 3: Prepare the features to be updated
      const settingToUpdate = bidRange.map((feature) => {
        const dataToUpdate = settingsMap.get(feature.id);
        if (dataToUpdate) {
          // If setting data exists for this feature, update it
          return {
            ...feature,
            bidIncrement: dataToUpdate.bidIncrement ?? feature.increment,
            pushNotification: dataToUpdate.heldAmount ?? feature.heldAmount,
          };
        }
        return feature; // No update if no setting data found
      });

      // Step 4: Save the updated features to the repository
      const updated =
        await this.auctionBidRangeRepository.save(settingToUpdate);

      return new SuccessResponse(AppStrings.SUCCESSFULL, updated);
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }

  async responseTime() {
    const [averageCloseTime, averageSupportTime] = await Promise.all([
      await this.averageCloseTime(),
      await this.averageSupportTime(),
    ]);

    const analysis = {
      averageCloseTime,
      averageSupportTime,
    };

    return analysis;
  }

  async averageSupportTime(): Promise<number> {
    // Fetch the relevant data from the database
    const tickets = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .select(['ticket.assignedAt', 'ticket.closedAt'])
      .where('ticket.assignedAt IS NOT NULL AND ticket.closedAt IS NOT NULL')
      .getMany();

    // Calculate the total time difference in seconds
    const totalTimeDifference = tickets.reduce((total, ticket) => {
      const assignedAt = ticket.assignedAt.getTime(); // Convert to milliseconds
      const closedAt = ticket.closedAt.getTime(); // Convert to milliseconds
      return total + (closedAt - assignedAt) / 1000; // Add the time difference in seconds
    }, 0);

    // Calculate the average time difference
    const avgTimeDifference =
      tickets.length > 0 ? totalTimeDifference / tickets.length : 0;

    return avgTimeDifference;
  }

  async ticket(findOption: AdminDashboardSort) {
    try {
      const now = new Date();
      const whereCondition: any = {};
      const dateField = 'createdAt';

      // Determine the time range based on the period
      if (findOption.timePeriod) {
        switch (findOption.timePeriod) {
          case 'today':
            whereCondition[dateField] = Between(startOfDay(now), endOfDay(now));
            break;
          case 'week':
            whereCondition[dateField] = Between(
              startOfWeek(now),
              endOfWeek(now),
            );
            break;
          case 'month':
            whereCondition[dateField] = Between(
              startOfMonth(now),
              endOfMonth(now),
            );
            break;
          case 'year':
            whereCondition[dateField] = Between(
              startOfYear(now),
              endOfYear(now),
            );
            break;
        }
      }

      // Build the query with the date condition and ticket status
      const [ticket, count] = await this.ticketsRepository
        .createQueryBuilder('ticket')
        .where(
          new Brackets((qb) => {
            qb.where(whereCondition).orWhere('ticket.status = :status', {
              status: TicketStatus.CLOSE,
            });
          }),
        )
        .getManyAndCount();

      return { ticket, count };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new BadRequestException(
        'An error occurred while fetching tickets.',
      );
    }
  }
  async averageCloseTime(): Promise<number> {
    // Fetch the relevant data from the database
    const tickets = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .select(['ticket.createdAt', 'ticket.closedAt'])
      .where('ticket.createdAt IS NOT NULL AND ticket.closedAt IS NOT NULL')
      .getMany();

    // Calculate the total time difference in seconds
    const totalTimeDifference = tickets.reduce((total, ticket) => {
      const createdAt = ticket.createdAt.getTime(); // Convert to milliseconds
      const closedAt = ticket.closedAt.getTime(); // Convert to milliseconds
      return total + (closedAt - createdAt) / 1000; // Add the time difference in seconds
    }, 0);

    // Calculate the average time difference
    const avgTimeDifference =
      tickets.length > 0 ? totalTimeDifference / tickets.length : 0;

    return avgTimeDifference;
  }

  //TODO implement when payment gateway is completed
  async saiiFees(findOptions: AdminDashboardSort) {
    try {
      // Fetch all listing types and invoices
      const [listingTypes, invoice] = await Promise.all([
        this.listingTypeRepository.queryBuilder('listingType').getMany(),
        this.invoiceRepository
          .createQueryBuilder('invoice')
          .leftJoinAndSelect('invoice.listingType', 'listingType')
          .where('invoice.listingType IS NOT NULL')
          .getMany(),
      ]);

      // Calculate total sum of all invoices
      const totalSum = invoice.reduce((acc, element) => acc + element.price, 0);

      // Group invoices by listingType and calculate fees for each type
      const feesByType = invoice.reduce((acc, element) => {
        console.log(element);
        const type = element.listingType.englishName;
        acc[type] = (acc[type] || 0) + element.price;
        return acc;
      }, {});

      // Prepare grouped fees for each listing type
      const group = listingTypes.map((value) => ({
        type: value.englishName,
        fees: feesByType[value.englishName] || 0,
      }));

      // Create the final result object
      const saiiFees: SaiiFees = {
        total: totalSum,
        group: group,
      };

      return saiiFees;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async financialVsOrder(findOptions: AdminDashboardSort) {
    try {
      const currentDate = new Date();
      let startDate, endDate, groupByInterval, duration;

      if (!findOptions || !findOptions.timePeriod) {
        throw new Error('Time period is required');
      }

      // Determine date range and grouping
      switch (findOptions.timePeriod) {
        case TimePeriod.Today:
          startDate = startOfDay(currentDate);
          endDate = endOfDay(currentDate);
          groupByInterval = 'hour';
          break;

        case TimePeriod.Week:
          const baseDate = subWeeks(currentDate, findOptions.value || 0);
          startDate = startOfWeek(baseDate);
          endDate = endOfWeek(baseDate);
          groupByInterval = 'day';
          break;

        case TimePeriod.Month:
          if (findOptions.value === 6) {
            const sixMonthsAgo = subMonths(currentDate, 5);
            startDate = startOfMonth(sixMonthsAgo);
            endDate = endOfMonth(currentDate);
            groupByInterval = 'month';
            duration = 6; // Last 6 months
          } else {
            const monthDate = subMonths(currentDate, findOptions.value || 0);
            startDate = startOfMonth(monthDate);
            endDate = endOfMonth(monthDate);
            groupByInterval = 'week'; // Weeks within the month
          }
          break;

        case TimePeriod.Year:
          const yearDate = subYears(currentDate, findOptions.value || 0);
          startDate = startOfYear(yearDate);
          endDate = endOfYear(yearDate);
          groupByInterval = 'month';
          break;

        default:
          throw new Error('Invalid time period');
      }

      // Query based on groupByInterval
      const groupIntervalSQL =
        groupByInterval === 'week'
          ? `FLOOR((EXTRACT(DAY FROM invoice.createdAt) - 1) / 7) + 1`
          : `EXTRACT(${groupByInterval.toUpperCase()} FROM invoice.createdAt)`;

      const transactions = await this.invoiceRepository
        .createQueryBuilder('invoice')
        .select(`${groupIntervalSQL}::int`, groupByInterval)
        .addSelect('invoice.type', 'fee')
        .addSelect('COALESCE(SUM(invoice.price), 0)::float', 'totalAmount')
        .addSelect('COALESCE(COUNT(invoice.id), 0)::int', 'totalOrder')
        .where('invoice.createdAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .groupBy(`${groupIntervalSQL}, invoice.type`)
        .orderBy(groupByInterval, 'ASC')
        .getRawMany();

      // Log to debug interval keys

      // Generate all intervals based on groupByInterval
      const allIntervals = (() => {
        switch (groupByInterval) {
          case 'day':
            return Array.from({ length: 7 }, (_, i) =>
              format(addDays(startOfWeek(startDate), i), 'EEEE'),
            );
          case 'week':
            return Array.from(
              { length: Math.ceil(differenceInDays(endDate, startDate) / 7) },
              (_, i) => `Week ${i + 1}`,
            );
          case 'month':
            if (duration === 6) {
              return Array.from({ length: 6 }, (_, i) =>
                format(addMonths(startDate, i), 'MMMM'),
              );
            }
            return Array.from({ length: 12 }, (_, i) =>
              format(addMonths(startOfYear(currentDate), i), 'MMMM'),
            );
          case 'hour':
            return Array.from({ length: 24 }, (_, i) => `${i}:00`);
          default:
            return [];
        }
      })();

      // Group transactions by interval
      const groupedTransactions = transactions.reduce(
        (acc, transaction) => {
          const interval = parseInt(transaction[groupByInterval]);
          acc[interval] = acc[interval] || [];
          acc[interval].push({
            fee: transaction.fee,
            totalAmount: parseFloat(transaction.totalAmount),
            totalOrder: parseInt(transaction.totalOrder),
          });
          return acc;
        },
        {} as { [key: number]: FinancialVsOrderResponse[] },
      );

      const payload = allIntervals.map((interval, idx) => {
        let difference, month;

        if (duration == 6) {
          month = getMonth(startDate) + 1;
          difference = true;
        }
        // Match transactions to the exact interval key
        const intervalKey = (idx + 1 + month).toString(); // Adjust for 1-based month indices
        const dataForInterval = groupedTransactions[intervalKey] || [];
        return {
          key: interval, // Human-readable interval (e.g., "October")
          data: dataForInterval, // Corresponding transaction data
        };
      });

      return payload;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error.message || 'An error occurred');
    }
  }

  async listingStats(
    findOption: AdminDashboardListingStatus,
  ): Promise<ListingStats> {
    try {
      const { take = 10, skip = 0, stage, status } = findOption;

      const currentDate = moment();
      const date = new Date(); // Use moment to handle the current date
      let startDate: Date, endDate: Date;

      // Determine date range based on time period
      switch (findOption.timePeriod) {
        case TimePeriod.Today:
          startDate = currentDate.startOf('day').toDate();
          endDate = date;
          break;
        case TimePeriod.Week:
          startDate = currentDate
            .subtract(findOption.value ?? 1, 'weeks')
            .startOf('week')
            .toDate();
          endDate = date;
          break;
        case TimePeriod.Month:
          startDate = currentDate
            .subtract(findOption.value ?? 1, 'months')
            .startOf('month')
            .toDate();
          endDate = date;
          break;
        case TimePeriod.Year:
          startDate = currentDate
            .subtract(findOption.value ?? 1, 'years')
            .startOf('year')
            .toDate();
          endDate = date;
          break;
        default:
          break;
      }

      // Initialize the query builder
      const query = this.offerRepository
        .createQueryBuilder('offer')
        .leftJoinAndSelect('offer.listing', 'listing');

      // Add conditions dynamically based on input
      if (stage) {
        query.andWhere('listing.stage = :stage', { stage });
      }

      if (status) {
        query.andWhere('offer.status = :status', { status });
      }

      const [
        offer,
        listing,
        acceptedOffer,
        ownershipTransfer,
        [offers, total],
      ] = await Promise.all([
        this.offerRepository.count({
          where: {
            createdAt: Between(startDate, endDate),
          },
        }),
        this.listingRepository.count({
          where: {
            createdAt: Between(startDate, endDate),
          },
        }),
        this.offerRepository.count({
          where: { status: OfferListEnum.ACCEPTED },
        }),

        this.listingRepository.count({
          where: {
            isListingSold: true,
            createdAt: Between(startDate, endDate),
          },
        }),
        query.take(take).skip(skip).getManyAndCount(),
      ]);

      return {
        offers,
        total,
        analysis: {
          offer,
          listing,
          acceptedOffer,
          ownershipTransfer,
        },
      };
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async userStats(findOption: AdminDashboardSort): Promise<UserStats> {
    // Calculate the start and end dates for the given number of months
    const endDate = new Date();
    const startDate = subMonths(endDate, findOption.value - 1);

    // Adjust to the start of the month for startDate and end of the month for endDate
    const startOfRange = startOfMonth(startDate);
    const endOfRange = endOfMonth(endDate);

    try {
      // Count users within the specified date range
      const users = await this.userRepository
        .createQueryBuilder('user')
        .where('user.createdAt BETWEEN :startOfRange AND :endOfRange', {
          startOfRange,
          endOfRange,
        })
        .getCount();

      const analysis: UserStats = { users };

      return analysis;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException('Failed to fetch user statistics');
    }
  }

  async userFunneling(findOption: AdminDashboardSort): Promise<UserFunneling> {
    // Calculate the start and end dates for the given number of months
    const endDate = new Date();
    const startDate = subMonths(endDate, findOption.value - 1);

    // Adjust to the start of the month for startDate and end of the month for endDate
    const startOfRange = startOfMonth(startDate);
    const endOfRange = endOfMonth(endDate);

    // Use raw SQL to count users by type and levels
    const [guestCount, levelOneCount, levelTwoCount] = await Promise.all([
      this.userTracking
        .createQueryBuilder('userTracking')
        .select('COUNT(*)', 'count')
        .where('userTracking.type = :type', { type: 'guest' })
        .andWhere('userTracking.createdAt BETWEEN :start AND :end', {
          start: startOfRange,
          end: endOfRange,
        })
        .getRawOne(),

      this.userRepository
        .createQueryBuilder('user')
        .select('COUNT(*)', 'count')
        .where('user.userLevel = :level', { level: UserLevelEnum.LEVEL_1 })
        .andWhere('user.createdAt BETWEEN :start AND :end', {
          start: startOfRange,
          end: endOfRange,
        })
        .getRawOne(),

      this.userRepository
        .createQueryBuilder('user')
        .select('COUNT(*)', 'count')
        .where('user.userLevel = :level', { level: UserLevelEnum.LEVEL_2 })
        .andWhere('user.createdAt BETWEEN :start AND :end', {
          start: startOfRange,
          end: endOfRange,
        })
        .getRawOne(),
    ]);

    // Extract counts from raw query results
    const guest = parseInt(guestCount.count, 10) || 0;
    const levelOne = parseInt(levelOneCount.count, 10) || 0;
    const levelTwo = parseInt(levelTwoCount.count, 10) || 0;

    // Construct the funneling result
    const userFunneling: UserFunneling = {
      guest,
      levelOne,
      levelTwo,
      converged: levelOne + levelTwo,
    };

    return userFunneling;
  }

  async userDashBoard(findOption: AdminDashboardSort) {
    const [gender, age, nationality, city] = await Promise.all([
      await this.userGenderCount(findOption),
      await this.userAgeCount(findOption),
      await this.usersCountry(findOption),
      await this.userDemography(findOption),
    ]);

    const analysis = {
      age,
      gender,
      nationality,
      city,
    };
    return analysis;
  }

  async userDemography(
    findOption: AdminDashboardSort,
  ): Promise<UserDemography> {
    const currentDate = moment();
    const date = new Date(); // Use moment to handle the current date
    let startDate: Date, endDate: Date;

    // Determine date range based on time period
    switch (findOption.timePeriod) {
      case TimePeriod.Today:
        startDate = currentDate.startOf('day').toDate();
        endDate = date;
        break;
      case TimePeriod.Week:
        startDate = currentDate
          .subtract(findOption.value ?? 1, 'weeks')
          .startOf('week')
          .toDate();
        endDate = date;
        break;
      case TimePeriod.Month:
        startDate = currentDate
          .subtract(findOption.value ?? 1, 'months')
          .startOf('month')
          .toDate();
        endDate = date;
        break;
      case TimePeriod.Year:
        startDate = currentDate
          .subtract(findOption.value ?? 1, 'years')
          .startOf('year')
          .toDate();
        endDate = date;
        break;
      default:
        break;
    }

    try {
      const query = this.userRepository
        .createQueryBuilder('user')
        // .leftJoin('user.nationalIdentity', 'nationalIdentity')
        .select('user.city')
        .addSelect('COUNT(*)', 'total')
        .where('user.city IS NOT NULL')
        .andWhere('user.nationality = :name ', {
          name: 'Saudi Arabia',
        })
        .groupBy('user.city');

      // ✅ Apply date filter only if `startDate` is provided
      if (startDate && endDate) {
        query.where('user.createdAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        });
      }

      const [userDemographyResult, user] = await Promise.all([
        query.getRawMany(),

        this.userRepository.count({
          where:
            startDate && endDate
              ? {
                  createdAt: Between(startDate, endDate),
                  city: Not(IsNull()), // Ensure it excludes NULL values
                  nationality: 'Saudi Arabia',
                }
              : { city: Not(IsNull()), nationality: 'Saudi Arabia' },
        }),
      ]);

      const userDemography: UserCity[] = userDemographyResult.map((item) => ({
        user_city: item.user_city,
        total: parseInt(item.total, 10),
      }));

      const data: UserDemography = { userDemography, total: user };

      return data;
    } catch (error) {
      console.log(error);
      this.logger.log(error);
      throw new BadRequestException('Failed to fetch user demography');
    }
  }

  async usersCountry(
    findOption: AdminDashboardSort,
  ): Promise<UserCountryCount[]> {
    const currentDate = moment();
    const date = new Date(); // Use moment to handle the current date
    let startDate: Date, endDate: Date;

    // Determine date range based on time period
    switch (findOption.timePeriod) {
      case TimePeriod.Today:
        startDate = currentDate.startOf('day').toDate();
        endDate = date;
        break;
      case TimePeriod.Week:
        startDate = currentDate
          .subtract(findOption.value ?? 1, 'weeks')
          .startOf('week')
          .toDate();
        endDate = date;
        break;
      case TimePeriod.Month:
        startDate = currentDate
          .subtract(findOption.value ?? 1, 'months')
          .startOf('month')
          .toDate();
        endDate = date;
        break;
      case TimePeriod.Year:
        startDate = currentDate
          .subtract(findOption.value ?? 1, 'years')
          .startOf('year')
          .toDate();
        endDate = date;
        break;
      default:
        break;
    }

    try {
      const result = await this.userRepository
        .createQueryBuilder('user')
        .select([
          `COUNT(*) FILTER (WHERE user.nationality ILIKE '%saudi%') AS "saudi"`,
          `COUNT(*) FILTER (WHERE user.nationality NOT ILIKE '%saudi%') AS "nonSaudi"`,
          `COUNT(*) FILTER (WHERE user.nationality IS NULL) AS "others"`,
        ])
        .getRawOne();

      const country: UserCountryCount[] = [
        { nationality: 'Saudi', count: result.saudi },
        { nationality: 'Non-Saudi', count: result.nonSaudi },
        { nationality: 'Unprovided', count: result.others },
      ];

      return country;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException('Failed to fetch user country count');
    }
  }
  async saudiVsNonSaudi(
    findOption: AdminDashboardSort,
  ): Promise<UserCountryCount[]> {
    const endDate = new Date();
    const startDate = subMonths(endDate, findOption.value);

    // Adjust to the start of the month for startDate and end of the month for endDate
    const startOfRange = startOfMonth(startDate);
    const endOfRange = endOfMonth(endDate);

    try {
      // Log the date range for debugging

      const result = await this.userRepository
        .createQueryBuilder('user')
        .select(
          `CASE 
      WHEN user.nationality ILIKE '%saudi%' THEN 'Saudi Users' 
      ELSE 'Non-Saudi Users' 
    END`,
          'category',
        )
        .addSelect('COUNT(*)', 'count')
        .where('user.createdAt BETWEEN :startOfRange AND :endOfRange', {
          startOfRange,
          endOfRange,
        })
        .groupBy('category')
        .getRawMany();

      // Map the result to a clean format
      const countryCounts: UserCountryCount[] = result.map((item) => {
        return {
          nationality: item.category,
          count: parseInt(item.count, 10),
        };
      });

      return countryCounts;
    } catch (error) {
      // Log the error for debugging
      this.logger.error('Error in saudiVsNonSaudi:', error);
      throw new BadRequestException('Failed to fetch user country count');
    }
  }

  async userGenderCount(
    findOption?: AdminDashboardSort,
  ): Promise<UserGenderCount[]> {
    // Use moment for consistent date handling
    const currentDate = moment();
    let startDate: Date | undefined;
    let endDate: Date = new Date(); // End date is always the current date

    // Calculate the start and end dates based on the time period provided in findOption
    if (findOption?.timePeriod && findOption?.value) {
      switch (findOption.timePeriod) {
        case TimePeriod.Today:
          startDate = currentDate.startOf('day').toDate();
          break;
        case TimePeriod.Week:
          startDate = currentDate
            .subtract(findOption.value ?? 1, 'weeks')
            .startOf('week')
            .toDate();
          break;
        case TimePeriod.Month:
          startDate = currentDate
            .subtract(findOption.value ?? 1, 'months')
            .startOf('month')
            .toDate();
          break;
        case TimePeriod.Year:
          startDate = currentDate
            .subtract(findOption.value ?? 1, 'years')
            .startOf('year')
            .toDate();
          break;
        default:
          break;
      }
    }

    try {
      // Query the user gender count
      const query = this.userRepository
        .createQueryBuilder('user')
        .select('user.gender')
        .addSelect('COUNT(*)', 'count')
        .groupBy('user.gender');

      // Apply date filter conditionally if startDate is defined
      if (startDate) {
        query.andWhere('user.createdAt BETWEEN :startOfRange AND :endOfRange', {
          startOfRange: startDate.toISOString(),
          endOfRange: endDate.toISOString(),
        });
      }

      const result = await query.getRawMany();

      // Map result to UserGenderCount format
      const genderCounts: UserGenderCount[] = result.map((item) => ({
        gender: item.user_gender,
        count: parseInt(item.count, 10), // Convert count to number
      }));

      return genderCounts;
    } catch (error) {
      this.logger.error('Error fetching user gender count:', error);
      throw new BadRequestException('Failed to fetch user gender count');
    }
  }

  async userAgeCount(findOption?: AdminDashboardSort): Promise<UserAgeRange[]> {
    try {
      let startOfRange: Date | undefined;
      let endOfRange: Date | undefined;

      // Compute the date range only if findOption is provided
      if (findOption?.value) {
        const endDate = new Date();
        const startDate = subMonths(endDate, findOption.value - 1);

        if (isNaN(startDate.getTime())) {
          throw new BadRequestException('Invalid start date calculation');
        }

        startOfRange = startOfMonth(startDate);
        endOfRange = endOfMonth(endDate);
      }

      const query = this.userRepository
        .createQueryBuilder('user')
        .select([
          `CASE 
              WHEN user.dateOfBirth IS NULL THEN 'unknown'
              WHEN DATE_PART('year', AGE(COALESCE(user.dateOfBirth, NOW()))) BETWEEN 18 AND 23 THEN '18-23'
              WHEN DATE_PART('year', AGE(COALESCE(user.dateOfBirth, NOW()))) BETWEEN 24 AND 30 THEN '24-30'
              WHEN DATE_PART('year', AGE(COALESCE(user.dateOfBirth, NOW()))) BETWEEN 31 AND 40 THEN '31-40'
              ELSE '41+' 
           END AS "age_range"`,
          `COUNT(*) AS "count"`,
        ])
        .where('user.deletedAt IS NULL') // Ensure deleted users are excluded
        .groupBy('age_range')
        .orderBy('age_range', 'ASC');

      // Apply date filter conditionally if startOfRange and endOfRange are available
      if (startOfRange && endOfRange) {
        query.andWhere('user.createdAt BETWEEN :startOfRange AND :endOfRange', {
          startOfRange: startOfRange.toISOString(),
          endOfRange: endOfRange.toISOString(),
        });
      }

      const result = await query.getRawMany();

      // Define all possible age ranges
      const allAgeRanges: UserAgeRange[] = [
        { age_range: '18-23', count: 0 },
        { age_range: '24-30', count: 0 },
        { age_range: '31-40', count: 0 },
        { age_range: '41+', count: 0 },
        { age_range: 'unknown', count: 0 }, // Users with no DOB
      ];

      // Merge database results with predefined ranges
      const ageRangeCounts: UserAgeRange[] = allAgeRanges.map((range) => {
        const found = result.find((item) => item.age_range === range.age_range);
        return {
          age_range: range.age_range,
          count: found ? Number(found.count) : 0, // Use database count if found, otherwise 0
        };
      });

      return ageRangeCounts;
    } catch (error) {
      this.logger.error('Error fetching user age count:', error);
      throw new BadRequestException('Failed to fetch user age count');
    }
  }

  async adminDefault() {
    try {
      const result = await this.adminRepository.find({ take: 1 });

      return result[0];
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException('Failed to fetch');
    }
  }
  async findOne(id: string) {
    try {
      return await this.couponRepository.findOneBy({ id });
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(AppStrings.NOT_FOUND);
    }
  }

  async createCoupon(createCouponInput: CreateCouponInput, admin: User) {
    try {
      const actionConfig =
        await this.workflowService.findOneWorkflowByDocumentname(
          this.userRepository.metadata.tableName,
        );

      const data = this.couponRepository.create({
        ...createCouponInput,
      });

      if (actionConfig) {
        await this.actionService.createActionRequest(
          {
            document: this.couponRepository.metadata.tableName,
            actionType: 'create',
            targetEntityId: null,
            user: admin,
            payload: JSON.stringify(data),
          },
          admin,
        );
        return new SuccessResponse('Action awaiting aproval');
      }
      const coupon = await this.couponRepository.save({
        ...createCouponInput,
      });
      if (coupon) {
        return new SuccessResponse(AppStrings.SUCCESSFULL);
      }

      // Log activity
      await this.activityLogService.logActivity([
        {
          adminId: admin.id,
          action: ActivityEnum.CREATED,
          couponId: coupon.id,
          details: JSON.stringify(coupon),
        },
      ]);
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async fetchCoupons(couponFilterInput: CouponFilter) {
    try {
      const now = new Date();
      const whereCondition: any = {};
      const dateField = 'createdAt';

      // Filter by time period
      switch (couponFilterInput.timePeriod) {
        case 'today':
          whereCondition[dateField] = Between(startOfDay(now), endOfDay(now));
          break;
        case 'week':
          whereCondition[dateField] = Between(startOfWeek(now), endOfWeek(now));
          break;
        case 'month':
          whereCondition[dateField] = Between(
            startOfMonth(now),
            endOfMonth(now),
          );
          break;
        case 'year':
          whereCondition[dateField] = Between(startOfYear(now), endOfYear(now));
          break;
      }

      // Add status filter
      let whereOption = '';
      if (couponFilterInput.status) {
        whereOption = 'coupon.status = :status';
      }

      const baseQuery = this.couponRepository
        .createQueryBuilder('coupon')
        .where(whereCondition);

      // Add dynamic whereOption condition if provided
      if (whereOption) {
        baseQuery.andWhere(whereOption, { status: couponFilterInput.status });
      }

      // Handle pagination defaults
      const take = couponFilterInput.take || 10;
      const skip = couponFilterInput.skip || 0;

      // Execute query
      const [coupon, total] = await baseQuery
        .take(take)
        .skip(skip)
        .getManyAndCount();

      return { coupon, total };
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error.message);
    }
  }

  async isCouponValid(
    validataCouponInput: ValidataCouponInput,
  ): Promise<IsCouponValidResponse> {
    try {
      let result: IsCouponValidResponse;
      const coupon = await this.couponRepository.findOne({
        where: { code: validataCouponInput.code },
      });

      if (!coupon) {
        result = {
          valid: false,
          amount: 0,
        };

        return result;
      }

      // Check if the coupon is valid
      if (
        coupon.endDate > new Date() &&
        !coupon.deactived &&
        coupon.maxUse > coupon.currentUse
      ) {
        let amount = validataCouponInput.price;
        switch (coupon.discountType) {
          case CouponEnum.NUMBER:
            amount = coupon.discountValue;
            break;

          case CouponEnum.PERCENT:
            amount = (coupon.discountValue / 100) * validataCouponInput.price;
            break;

          default:
            break;
        }

        result = {
          valid: true,
          amount,
        };
        return result;
      }
      result = {
        valid: false,
        amount: validataCouponInput.price,
      };
      return result;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(
        error.message || 'Failed to validate coupon',
      );
    }
  }
  async updateCoupon(updateCouponInput: UpdateCouponInput, admin: User) {
    try {
      const [actionConfig, coupons] = await Promise.all([
        this.workflowService.findOneWorkflowByDocumentname(
          this.userRepository.metadata.tableName,
        ),
        this.couponRepository.findOne({
          where: { id: updateCouponInput.id },
        }),
      ]);

      const updatedCoupons: Partial<Coupon> = {
        startDate: updateCouponInput.startDate ?? coupons.startDate,
        endDate: updateCouponInput.endDate ?? coupons.endDate,
        maxUse: updateCouponInput.maxUse ?? coupons.maxUse,
        discountType: updateCouponInput.discountType ?? coupons.discountType,
        discountValue: updateCouponInput.discountValue ?? coupons.discountValue,
      };

      if (actionConfig) {
        await this.actionService.createActionRequest(
          {
            document: this.couponRepository.metadata.tableName,
            actionType: 'update',
            targetEntityId: null,
            user: admin,
            payload: JSON.stringify(updatedCoupons),
          },
          admin,
        );
        return new SuccessResponse('Awaiting action approval');
      }

      const { affected } = await this.couponRepository.update(
        coupons.id,
        updatedCoupons,
      );

      if (affected) {
        const data = await this.couponRepository.findOneBy({ id: coupons.id });

        await this.activityLogService.logActivity([
          {
            adminId: admin.id,
            action: ActivityEnum.UPDATED,
            couponId: data.id,
            details: JSON.stringify(data),
          },
        ]);

        return new SuccessResponse(AppStrings.SUCCESSFULL, data);
      }
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async deleteCoupon(deleteCouponInput: DeleteCouponInput, admin: User) {
    try {
      const [actionConfig, coupons] = await Promise.all([
        this.workflowService.findOneWorkflowByDocumentname(
          this.userRepository.metadata.tableName,
        ),
        this.couponRepository.find({
          where: { id: In(deleteCouponInput.id) },
        }),
      ]);
      const deletedCoupons = coupons.map((element) => {
        const coupon: Partial<Coupon> = {
          deletedAt: new Date(),
        };
        return { ...element, ...coupon };
      });

      if (actionConfig) {
        await this.actionService.createActionRequest(
          {
            document: this.couponRepository.metadata.tableName,
            actionType: 'update',
            targetEntityId: null,
            user: admin,
            payload: JSON.stringify(deletedCoupons),
          },
          admin,
        );

        return new SuccessResponse('Awaiting action approval');
      }

      await this.couponRepository.save(deletedCoupons);
      return new SuccessResponse(AppStrings.DELETED_SUCCESSFULLY);
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async deactivateCoupon(
    deactivateCouponInput: DeactivateCouponInput,
    admin: User,
  ) {
    try {
      const [actionConfig, coupons] = await Promise.all([
        this.workflowService.findOneWorkflowByDocumentname(
          this.userRepository.metadata.tableName,
        ),
        this.couponRepository.find({
          where: { id: In(deactivateCouponInput.id) },
        }),
      ]);
      const deactivateCoupon = coupons.map((element) => {
        const coupon: Partial<Coupon> = {
          deactived: true,
        };
        return { ...element, ...coupon };
      });

      if (actionConfig) {
        await this.actionService.createActionRequest(
          {
            document: this.couponRepository.metadata.tableName,
            actionType: 'create',
            targetEntityId: null,
            user: admin,
            payload: JSON.stringify(deactivateCoupon),
          },
          admin,
        );

        return new SuccessResponse('Awaiting action approval');
      }
      await this.couponRepository.save(deactivateCoupon);

      return new SuccessResponse(AppStrings.SUCCESSFULL);
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async reactivateCoupon(
    deactivateCouponInput: DeactivateCouponInput,
    admin: User,
  ) {
    try {
      const [actionConfig, coupons] = await Promise.all([
        this.workflowService.findOneWorkflowByDocumentname(
          this.userRepository.metadata.tableName,
        ),
        this.couponRepository.find({
          where: { id: In(deactivateCouponInput.id) },
        }),
      ]);
      const deactivateCoupon = coupons.map((element) => {
        const coupon: Partial<Coupon> = {
          deactived: false,
        };
        return { ...element, ...coupon };
      });

      if (actionConfig) {
        await this.actionService.createActionRequest(
          {
            document: this.couponRepository.metadata.tableName,
            actionType: 'create',
            targetEntityId: null,
            user: admin,
            payload: JSON.stringify(deactivateCoupon),
          },
          admin,
        );

        return new SuccessResponse('Awaiting action approval');
      }
      await this.couponRepository.save(deactivateCoupon);

      return new SuccessResponse(AppStrings.SUCCESSFULL);
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async activateAndDeactivateFeatures(
    data: SystemFeatureSettingInput,
    admin: User,
  ) {
    try {
      // Step 1: Create a lookup for the system feature settings by id
      const settingsMap = new Map(
        data.SystemFeatureSetting.map((feature) => [feature.id, feature]),
      );

      // Step 2: Retrieve the features from the database
      const features = await this.systemFeatureRepository.find({
        where: {
          id: In(data.SystemFeatureSetting.map((feature) => feature.id)),
        },
      });

      // Step 3: Prepare the features to be updated
      const settingToUpdate = features.map((feature) => {
        const featureData = settingsMap.get(feature.id);
        if (featureData) {
          // If setting data exists for this feature, update it
          return {
            ...feature,
            isActive: featureData.isActive,
          };
        }
        // Optionally handle the case where no matching setting is found
        return feature; // No update if no setting data found
      });

      // Step 4: Save the updated features to the repository
      const updated = await this.systemFeatureRepository.save(settingToUpdate);

      return new SuccessResponse(AppStrings.SUCCESSFULL, updated);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async findAllFeatures(admin?: User) {
    try {
      const feature = await this.systemFeatureRepository.find();

      return feature;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async searchForCoupon(searchParam: string) {
    try {
      return await this.couponRepository
        .createQueryBuilder('coupon')
        .orWhere('coupon.name ILIKE :term', {
          term: `%${searchParam}%`,
        })
        .orWhere('coupon.appliedTo ILIKE :term', {
          term: `%${searchParam}%`,
        })

        .take(10)
        .getMany();
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }
}
