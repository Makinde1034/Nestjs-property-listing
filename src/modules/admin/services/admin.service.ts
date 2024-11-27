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
  eachQuarterOfInterval,
  endOfMonth,
  startOfMonth,
  subMonths,
  startOfDay,
  endOfDay,
  endOfWeek,
  startOfWeek,
} from 'date-fns';

import { Between, Brackets, In } from 'typeorm';
import { OfferListEnum } from '../../../common/enums/status.enum';
import {
  SaiiFees,
  FinancialVsOrder,
  ListingStats,
  UserStats,
  UserFunneling,
  UserDemography,
  UserCity,
  UserCountryCount,
  UserGenderCount,
  UserAgeRange,
  CouponResponse,
} from '../dto/response/admin-response';
import { TicketRepository } from '../../tickets/repositories';
import {
  AdminDashboardListingStatus,
  AdminDashboardSort,
  AdminDefaultInput,
  UpdateAdminDefaultInput,
} from '../dto/request/admin-request';
import { AdminRepository } from '../repositories/admin.repository';
import { CouponRepository } from '../repositories/coupons.repository';
import {
  CreateCouponInput,
  DeactivateCouponInput,
  DeleteCouponInput,
  UpdateCouponInput,
} from '../dto/request/coupons';
import { Coupon } from '../../../entities/coupon.entity';
import { generateRandomArray } from '../../../common/utils/helper';
import slugify from 'slugify';
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
import {
  TicketStatus,
  UserInterfaceType,
  UserLevelEnum,
  UserProfileTypeEnum,
} from '../../../common/enums';

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
    private readonly transactionRepository: TransactionRepository,
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

      console.log(bidRange);

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

  async averageSupportTime() {
    const result = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .select(
        'AVG(EXTRACT(EPOCH FROM (ticket.closedAt - ticket.assignedAt)))',
        'avgTimeDifference',
      )
      .where('ticket.assignedAt IS NOT NULL AND ticket.closedAt IS NOT NULL')
      .getRawOne();

    const avgTimeDifference = parseFloat(result.avgTimeDifference);

    if (isNaN(avgTimeDifference)) {
      return 0;
    }

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
  async averageCloseTime() {
    const result = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .select(
        'AVG(EXTRACT(EPOCH FROM (ticket."closedAt" - ticket.createdAt)))',
        'avgTimeDifference',
      )
      .where('ticket.createdAt IS NOT NULL AND ticket.closedAt IS NOT NULL')
      .getRawOne();

    const avgTimeDifference = parseFloat(result.avgTimeDifference);

    if (isNaN(avgTimeDifference)) {
      return 0;
    }

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
          .where('invoice.listingType IS NOT NULL')
          .getMany(),
      ]);

      // Calculate total sum of all invoices
      const totalSum = invoice.reduce((acc, element) => acc + element.price, 0);

      // Group invoices by listingType and calculate fees for each type
      const feesByType = invoice.reduce((acc, element) => {
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
      console.log(error);
    }
  }

  async financialVsOrder(findOptions: AdminDashboardSort) {
    const currentDate = new Date();
    let startDate, endDate, groupByInterval;

    // Determine date range and grouping based on timePeriod
    switch (findOptions.timePeriod) {
      case TimePeriod.Today:
        startDate = startOfDay(currentDate);
        endDate = endOfDay(currentDate);
        groupByInterval = 'hour';
        break;
      case TimePeriod.Week:
        startDate = startOfWeek(currentDate);
        endDate = endOfWeek(currentDate);
        groupByInterval = 'day';
        break;
      case TimePeriod.Month:
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
        groupByInterval = 'day';
        break;
      case TimePeriod.Year:
        const oneYearAgo = subYears(currentDate, findOptions.value);
        startDate = startOfYear(oneYearAgo);
        endDate = endOfYear(oneYearAgo);
        groupByInterval = 'month';
        break;
      default:
        throw new Error('Invalid time period');
    }

    // Query transactions and group by the specified interval
    const transactions = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select(
        `EXTRACT(${groupByInterval.toUpperCase()} FROM invoice.createdAt)::int`,
        groupByInterval,
      )
      .addSelect('invoice.type', 'fee')
      .addSelect('COALESCE(SUM(invoice.price), 0)::float', 'totalAmount')
      .addSelect('COALESCE(COUNT(invoice.id), 0)::int', 'totalOrder')
      .where('invoice.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy(
        `EXTRACT(${groupByInterval.toUpperCase()} FROM invoice.createdAt), invoice.type`,
      )
      .orderBy(`${groupByInterval}`)
      .getRawMany();

    // Initialize result structure
    const result: FinancialVsOrder[] = [];

    // Handle different cases
    if (findOptions.timePeriod === TimePeriod.Today) {
      const dailyData = transactions.map((t) => ({
        fee: t.fee, // Use fee from transactions
        totalAmount: parseFloat(t.totalAmount),
        totalOrder: parseInt(t.totalOrder),
      }));
      result.push(...dailyData);
    } else if (findOptions.timePeriod === TimePeriod.Year) {
      const yearlyData = transactions.map((t) => ({
        fee: t.fee, // Use fee from transactions
        totalAmount: parseFloat(t.totalAmount) ?? 0,
        totalOrder: parseInt(t.totalOrder) ?? 0,
      }));
      result.push(...yearlyData);
    } else {
      const intervalCount =
        groupByInterval === 'day'
          ? findOptions.timePeriod === TimePeriod.Week
            ? 7
            : 30
          : 12;

      for (let i = 0; i < intervalCount; i++) {
        const intervalData = transactions
          .filter((t) => parseInt(t[groupByInterval]) === i + 1)
          .map((t) => ({
            fee: t.fee, // Use fee from transactions
            totalAmount: parseFloat(t.totalAmount) || 0,
            totalOrder: parseInt(t.totalOrder) || 0,
          }));

        const totalAmount = intervalData.reduce(
          (sum, data) => sum + data.totalAmount,
          0,
        );
        const totalOrder = intervalData.reduce(
          (sum, data) => sum + data.totalOrder,
          0,
        );

        result.push({
          fee: intervalData.length ? intervalData[0].fee : null, // Keep the first fee of the interval
          totalAmount,
          totalOrder,
        });
      }
    }

    return result;
  }
  async listingStats(
    findOption: AdminDashboardListingStatus,
  ): Promise<ListingStats> {
    const { take = 10, skip = 0, stage, status } = findOption;

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

    // Execute the query
    const [offers, total] = await query.take(take).skip(skip).getManyAndCount();

    // Add other aggregated stats
    const [offer, listing, acceptedOffer, ownershipTransfer] =
      await Promise.all([
        this.offerRepository.count({}),
        this.listingRepository.count({}),
        this.offerRepository.count({
          where: { status: OfferListEnum.EXPIRED },
        }),
        this.listingRepository.count({ where: { isListingSold: true } }),
      ]);

    // Return the result
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

    const [guest, levelOne, levelTwo] = await Promise.all([
      this.userTracking.count({
        where: {
          type: 'guest',
          createdAt: Between(startOfRange, endOfRange),
        },
      }),
      this.userRepository.count({
        where: {
          userLevel: UserLevelEnum.LEVEL_1,
          createdAt: Between(startOfRange, endOfRange),
        },
      }),
      this.userRepository.count({
        where: {
          // TODO: Replace with actual condition for converged users

          userLevel: UserLevelEnum.LEVEL_2,

          createdAt: Between(startOfRange, endOfRange),
        },
      }),
    ]);

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
    // Calculate the start and end dates for the given number of months
    const endDate = new Date();
    const startDate = subMonths(endDate, findOption.value - 1);

    // Adjust to the start of the month for startDate and end of the month for endDate
    const startOfRange = startOfMonth(startDate);
    const endOfRange = endOfMonth(endDate);

    try {
      const [userDemographyResult, totalListings] = await Promise.all([
        this.userRepository
          .createQueryBuilder('user')
          .select('user.city')
          .addSelect('COUNT(*)', 'total')
          .where('user.createdAt BETWEEN :startOfRange AND :endOfRange', {
            startOfRange,
            endOfRange,
          })
          .groupBy('user.city')
          .getRawMany(),
        this.listingRepository.count({
          where: {
            createdAt: Between(startOfRange, endOfRange),
          },
        }),
      ]);
      const userDemography: UserCity[] = userDemographyResult.map((item) => ({
        user_city: item.user_city,
        total: parseInt(item.total, 10), // Convert total to number
      }));

      const data: UserDemography = { userDemography, total: totalListings };

      return data;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException('Failed to fetch user demography');
    }
  }

  async usersCountry(
    findOption: AdminDashboardSort,
  ): Promise<UserCountryCount[]> {
    // Calculate the start and end dates for the given number of months
    const endDate = new Date();
    const startDate = subMonths(endDate, findOption.value - 1);

    // Adjust to the start of the month for startDate and end of the month for endDate
    const startOfRange = startOfMonth(startDate);
    const endOfRange = endOfMonth(endDate);

    try {
      const result = await this.userRepository
        .createQueryBuilder('user')
        .select('user.nationality')
        .addSelect('COUNT(*)', 'count')
        .where('user.createdAt BETWEEN :startOfRange AND :endOfRange', {
          startOfRange,
          endOfRange,
        })
        .groupBy('user.nationality')
        .getRawMany();

      // Map result to UserCountryCount format
      const countryCounts: UserCountryCount[] = result.map((item) => ({
        nationality: item.nationality,
        count: parseInt(item.count, 10), // Convert count to number
      }));

      return countryCounts;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException('Failed to fetch user country count');
    }
  }

  async userGenderCount(
    findOption: AdminDashboardSort,
  ): Promise<UserGenderCount[]> {
    // Calculate the start and end dates for the given number of months
    const endDate = new Date();
    const startDate = subMonths(endDate, findOption.value - 1);

    // Adjust to the start of the month for startDate and end of the month for endDate
    const startOfRange = startOfMonth(startDate);
    const endOfRange = endOfMonth(endDate);

    try {
      const result = await this.userRepository
        .createQueryBuilder('user')
        .select('user.gender')
        .addSelect('COUNT(*)', 'count')
        .where('user.createdAt BETWEEN :startOfRange AND :endOfRange', {
          startOfRange,
          endOfRange,
        })
        .groupBy('user.gender')
        .getRawMany();

      // Map result to UserGenderCount format

      const genderCounts: UserGenderCount[] = result.map((item) => ({
        gender: item.user_gender,
        count: parseInt(item.count, 10), // Convert count to number
      }));

      return genderCounts;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException('Failed to fetch user gender count');
    }
  }

  async userAgeCount(findOption: AdminDashboardSort): Promise<UserAgeRange[]> {
    // Calculate the start and end dates for the given number of months
    const endDate = new Date();
    const startDate = subMonths(endDate, findOption.value - 1);

    // Adjust to the start of the month for startDate and end of the month for endDate
    const startOfRange = startOfMonth(startDate);
    const endOfRange = endOfMonth(endDate);

    try {
      const result = await this.userRepository
        .createQueryBuilder('user')
        .select(
          `
          CASE
            WHEN user.age BETWEEN 18 AND 23 THEN '18-23'
            WHEN user.age BETWEEN 24 AND 30 THEN '24-30'
            WHEN user.age BETWEEN 31 AND 40 THEN '31-40'
            ELSE 'others'
          END as age_range
        `,
        )
        .addSelect('COUNT(*)', 'count')
        .where('user.createdAt BETWEEN :startOfRange AND :endOfRange', {
          startOfRange,
          endOfRange,
        })
        .andWhere('user.deletedAt IS NULL')
        .groupBy('age_range')
        .getRawMany();

      // Map result to UserAgeRange format
      const ageRangeCounts: UserAgeRange[] = result.map((item) => ({
        age_range: item.age_range,
        count: parseInt(item.count, 10), // Convert count to number
      }));

      return ageRangeCounts;
    } catch (error) {
      this.logger.log(error);
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
          this.userRepository.metadata.name,
        );

      const data = this.couponRepository.create({
        ...createCouponInput,
      });

      if (actionConfig) {
        await this.actionService.createActionRequest(
          {
            document: this.couponRepository.metadata.name,
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

  async fetchCoupons(couponFilterInput: AdminFilterAndSort) {
    try {
      const now = new Date();
      const whereCondition: any = {};
      const dateField = 'createdAt';
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
      const [coupon, total] = await this.couponRepository
        .createQueryBuilder('coupons')
        .where(whereCondition, {
          whereParam: couponFilterInput.where?.whereParam,
        })
        .take(couponFilterInput.take)
        .skip(couponFilterInput.skip)
        .getManyAndCount();

      return { coupon, total };
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async isCouponValid(code: string, price: number) {
    try {
      let result: CouponResponse;
      const coupon = await this.couponRepository.findOne({
        where: { code },
      });

      if (!coupon) {
        result = {
          valid: false,
          amount: price,
        };

        return result;
      }

      // Check if the coupon is valid
      if (
        coupon.endDate > new Date() &&
        !coupon.deactived &&
        coupon.maxUse > coupon.currentUse
      ) {
        let amount = price;

        switch (coupon.discountType) {
          case CouponEnum.NUMBER:
            amount = price - coupon.discountValue;
            break;

          case CouponEnum.PERCENT:
            amount = price - (coupon.discountValue / 100) * price;
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
        amount: price,
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
          this.userRepository.metadata.name,
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
            document: this.couponRepository.metadata.name,
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
          this.userRepository.metadata.name,
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
            document: this.couponRepository.metadata.name,
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
          this.userRepository.metadata.name,
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
            document: this.couponRepository.metadata.name,
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
          this.userRepository.metadata.name,
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
            document: this.couponRepository.metadata.name,
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
