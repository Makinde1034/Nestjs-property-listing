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

import { Between, In } from 'typeorm';
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
      let result;
      const min = adminDefaultInput.minBidRange;
      const max = adminDefaultInput.maxBidRange;
      const increment = adminDefaultInput.bidIncrement;
      const id = adminDefaultInput.bidIncrementId;

      const bidPriceRange = await this.auctionBidRangeRepository
        .createQueryBuilder('auctionBidRange')
        .where(
          ' id = :id OR auctionBidRange.lowerBound >= :min AND auctionBidRange.upperBound <= :max',
          { id, min, max },
        )
        .getOne();

      if (bidPriceRange) {
        result = await this.auctionBidRangeRepository.update(id, {
          increment: increment,
        });
      } else {
        result = await this.auctionBidRangeRepository.save({
          lowerBound: min,
          upperBound: max,
          increment: increment,
        });
      }
      return new SuccessResponse(AppStrings.SUCCESSFULL, result);
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
        groupByInterval = 'category';
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
    const transactions = await this.transactionRepository
      .createQueryBuilder('transactionLog')
      .select(
        `EXTRACT(${groupByInterval.toUpperCase()} FROM transactionLog.createdAt)::int`,
        groupByInterval,
      )
      .addSelect('transactionLog.category', 'fee')
      .addSelect(
        'COALESCE(SUM(transactionLog.amount), 0)::float',
        'totalAmount',
      )
      .addSelect('COALESCE(COUNT(transactionLog.id), 0)::int', 'totalOrder')
      .where('transactionLog.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy(
        `EXTRACT(${groupByInterval.toUpperCase()} FROM transactionLog.createdAt), transactionLog.category`,
      )
      .orderBy(`${groupByInterval}`)
      .getRawMany();

    // Initialize result structure
    let result = [];

    if (findOptions.timePeriod === TimePeriod.Today) {
      const dailyData = transactions.map((t) => ({
        fee: t.fee,
        totalAmount: parseFloat(t.totalAmount),
        totalOrder: t.totalOrder,
      }));
      result.push(dailyData);
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
            fee: t.fee ?? 0,
            totalAmount: parseFloat(t.totalAmount) ?? 0,
            totalOrder: t.totalOrder ?? 0,
          }));
        result.push(intervalData);
      }
    }

    return result;
  }

  async listingStats(findOption: AdminDashboardSort): Promise<ListingStats> {
    // Calculate the start and end dates for the given number of months
    const endDate = new Date();
    const startDate = subMonths(endDate, findOption.value - 1);

    // Adjust to the start of the month for startDate and end of the month for endDate
    const startOfRange = startOfMonth(startDate);
    const endOfRange = endOfMonth(endDate);

    const [offer, listing, acceptedOffer, ownershipTransfer] =
      await Promise.all([
        this.offerRepository.count({
          where: {
            createdAt: Between(startOfRange, endOfRange),
          },
        }),
        this.listingRepository.count({
          where: {
            createdAt: Between(startOfRange, endOfRange),
          },
        }),
        this.offerRepository.count({
          where: {
            status: OfferListEnum.EXPIRED,
            createdAt: Between(startOfRange, endOfRange),
          },
        }),
        this.listingRepository.count({
          where: {
            isListingSold: true,
            createdAt: Between(startOfRange, endOfRange),
          },
        }),
      ]);

    const analysis: ListingStats = {
      offer,
      listing,
      acceptedOffer,
      ownershipTransfer,
    };

    return analysis;
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

    const [guest, levelOne, converged] = await Promise.all([
      this.userTracking.count({
        where: {
          type: 'guest',
          createdAt: Between(startOfRange, endOfRange),
        },
      }),
      this.userRepository.count({
        where: {
          // TODO: Replace with actual condition for levelOne users
          createdAt: Between(startOfRange, endOfRange),
        },
      }),
      this.userRepository.count({
        where: {
          // TODO: Replace with actual condition for converged users
          createdAt: Between(startOfRange, endOfRange),
        },
      }),
    ]);

    const userFunneling: UserFunneling = {
      guest,
      levelOne,
      levelTwo: 0, // Placeholder value; update based on actual conditions
      converged,
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
      throw new BadRequestException('Failed to fetch user age count');
    }
  }

  async createCoupon(createCouponInput: CreateCouponInput, admin: User) {
    try {
      const actionConfig =
        await this.workflowService.findOneWorkflowByDocumentname(
          this.userRepository.metadata.name,
        );

      const code = generateRandomArray(1, 6);
      const data = this.couponRepository.create({
        code: slugify(code[0].toUpperCase()),
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
        code: slugify(code[0].toUpperCase()),
        ...createCouponInput,
      });
      if (coupon) {
        return new SuccessResponse(AppStrings.SUCCESSFULL);
      }
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async fetchCoupons() {
    try {
      return await this.couponRepository.find({});
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

  async updateBidIncrement(data: AdminDefaultInput) {
    try {
      const { bidIncrementId, bidIncrement } = data;
      const bidRange = await this.auctionBidRangeRepository.findOne({
        where: { id: bidIncrementId },
      });

      await this.auctionBidRangeRepository.update(
        { id: bidRange.id },
        { increment: bidIncrement },
      );
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async activateAndDeactivateFeatures(
    data: SystemFeatureSettingInput,
    admin: User,
  ) {
    try {
      const feature = await this.systemFeatureRepository.find({
        where: { id: In(data.id) },
      });

      const settingToUpdate = feature.map((element) => ({
        ...element,
        isActive: data.isActive,
      }));

      const updated = await this.systemFeatureRepository.save(settingToUpdate);

      return new SuccessResponse(AppStrings.SUCCESSFULL, updated);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
