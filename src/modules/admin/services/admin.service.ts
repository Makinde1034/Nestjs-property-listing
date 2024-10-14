/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ListingRepository } from '../../listing/repositories/listing.repository';
import { OfferRepository } from '../../listing/repositories';

import { UserRepository } from '../../user/repositories';

import { UserTrackingRepository } from '../../user/repositories/user-tracking-repository';
import { IssueRepository } from '../../issue/repositories';

import {
  startOfYear,
  endOfYear,
  subYears,
  eachQuarterOfInterval,
  endOfMonth,
  startOfMonth,
  subMonths,
  isThisMinute,
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
} from '../dto/response/admin-response';
import { TicketRepository } from '../../tickets/repositories';
import { AdminDashboardSort } from '../dto/request/admin-request';
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
  ) {}

  logger = new Logger(AdminService.name);

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
        'AVG(EXTRACT(EPOCH FROM (ticket.assignedAt - ticket.closedAt)))',
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
        'AVG(EXTRACT(EPOCH FROM (ticket.createdAt - ticket."closedAt")))',
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

  saiiFees(findOptions: AdminDashboardSort) {
    const saiiFees: SaiiFees = {
      total: 95000 + findOptions.value,
      group: [
        { type: 'land', fees: 30000 },
        { type: 'apartment', fees: 20000 },
        { type: 'building', fees: 10000 },

        { type: 'farm', fees: 35000 },
      ],
    };

    return saiiFees;
  }

  async financialVsOrder(findOptions: AdminDashboardSort) {
    const oneYearAgo = subYears(new Date(), findOptions.value);
    const startOfYearDate = startOfYear(oneYearAgo);
    const endOfYearDate = endOfYear(oneYearAgo);

    // Create a list of all quarters for the past year
    const quarters = eachQuarterOfInterval({
      start: startOfYearDate,
      end: endOfYearDate,
    }).map((date) => {
      const year = date.getFullYear();
      const quarter = Math.ceil((date.getMonth() + 1) / 3); // Calculate the quarter
      return { year, quarter };
    });

    // Query for sold items in the past year
    const soldItems = await this.listingRepository
      .createQueryBuilder('listing')
      .select('EXTRACT(YEAR FROM listing.soldDate)::int', 'year')
      .addSelect('EXTRACT(QUARTER FROM listing.soldDate)::int', 'quarter')
      .addSelect('SUM(listing.price)::float', 'totalSold')
      .where('listing.soldDate BETWEEN :startOfYear AND :endOfYear', {
        startOfYear: startOfYearDate,
        endOfYear: endOfYearDate,
      })
      .groupBy('year, quarter')
      .orderBy('year, quarter')
      .getRawMany();

    // Query for placed orders in the past year
    const placedOrders = await this.offerRepository
      .createQueryBuilder('offer')
      .select('EXTRACT(YEAR FROM offer.createdAt)::int', 'year')
      .addSelect('EXTRACT(QUARTER FROM offer.createdAt)::int', 'quarter')
      .addSelect('SUM(offer.offerPrice)::float', 'totalOrdered')
      .where('offer.createdAt BETWEEN :startOfYear AND :endOfYear', {
        startOfYear: startOfYearDate,
        endOfYear: endOfYearDate,
      })
      .groupBy('year, quarter')
      .orderBy('year, quarter')
      .getRawMany();

    // Initialize the combined results with all quarters set to zero
    const combined = quarters.reduce((acc, { year, quarter }) => {
      acc[`${year}-Q${quarter}`] = {
        year,
        quarter,
        totalSold: 0,
        totalOrdered: 0,
      };
      return acc;
    }, {});

    // Update combined results with actual data
    soldItems.forEach((item) => {
      const key = `${item.year}-Q${item.quarter}`;
      if (combined[key]) {
        combined[key].totalSold = parseFloat(item.totalSold);
      }
    });

    placedOrders.forEach((item) => {
      const key = `${item.year}-Q${item.quarter}`;
      if (combined[key]) {
        combined[key].totalOrdered = parseFloat(item.totalOrdered);
      }
    });

    // Convert the combined results object to an array
    const result: FinancialVsOrder[] = Object.values(combined);

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
      const result = await this.adminRepository.find();

      return result[0];
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException('Failed to fetch user age count');
    }
  }

  async createCoupon(createCouponInput: CreateCouponInput) {
    try {
      const code = generateRandomArray(1, 6);
      return await this.couponRepository.save({
        code: slugify(code[0].toUpperCase()),
        ...createCouponInput,
      });
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

  async isCouponValid(code: string, amount: number) {
    try {
      const coupon = await this.couponRepository.findOne({
        where: { code },
      });

      if (!coupon) {
        return { valid: false, message: 'Coupon not found' };
      }

      // Check if the coupon is valid
      if (
        coupon.endDate > new Date() &&
        !coupon.deactived &&
        coupon.maxUse > coupon.currentUse
      ) {
        let newAmount = amount;

        switch (coupon.discountType) {
          case CouponEnum.NUMBER:
            newAmount = amount - coupon.discountValue;
            break;

          case CouponEnum.PERCENT:
            newAmount = amount - (coupon.discountValue / 100) * amount;
            break;

          default:
            break;
        }

        return {
          valid: true,
          newAmount,
          message: null,
        };
      }

      return {
        valid: false,
        amount,
        message: 'Coupon is expired, deactivated, or has reached usage limits',
      };
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(
        error.message || 'Failed to validate coupon',
      );
    }
  }

  async updateCoupon(updateCouponInput: UpdateCouponInput) {
    try {
      const coupons = await this.couponRepository.findOne({
        where: { id: updateCouponInput.id },
      });

      const updatedCoupons: Partial<Coupon> = {
        startDate: updateCouponInput.startDate ?? coupons.startDate,
        endDate: updateCouponInput.endDate ?? coupons.endDate,
        maxUse: updateCouponInput.maxUse ?? coupons.maxUse,
        discountType: updateCouponInput.discountType ?? coupons.discountType,
        discountValue: updateCouponInput.discountValue ?? coupons.discountValue,
      };

      const { affected } = await this.couponRepository.update(
        coupons.id,
        updatedCoupons,
      );

      if (affected) {
        return await this.couponRepository.findOneBy({ id: coupons.id });
      }
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }
  async deleteCoupon(deleteCouponInput: DeleteCouponInput) {
    try {
      const coupons = await this.couponRepository.find({
        where: { id: In(deleteCouponInput.id) },
      });
      const deletedCoupons = coupons.map((element) => {
        const coupon: Partial<Coupon> = {
          deletedAt: new Date(),
        };
        return { ...element, ...coupon };
      });
      await this.couponRepository.save(deletedCoupons);
      return new SuccessResponse(AppStrings.DELETED_SUCCESSFULLY);
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async deactivateCoupon(deactivateCouponInput: DeactivateCouponInput) {
    try {
      const coupons = await this.couponRepository.find({
        where: { id: In(deactivateCouponInput.id) },
      });
      const deactivateCoupon = coupons.map((element) => {
        const coupon: Partial<Coupon> = {
          deactived: true,
        };
        return { ...element, ...coupon };
      });
      await this.couponRepository.save(deactivateCoupon);

      return new SuccessResponse(AppStrings.SUCCESSFULL);
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }
}
