/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ReviewRepository } from '../repository/review.repository';
import { CreateReviewDto } from '../dto/create-review.dto';
import { Review, User } from '../../../entities';
import { AppStrings } from '../../../common/messages/app.strings';
import { FindManyReviewDto } from '../dto/review.dto';

import { Between, FindOptionsOrder } from 'typeorm';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from 'date-fns';

@Injectable()
export class ReviewService {
  constructor(private reviewRepository: ReviewRepository) {}
  logger = new Logger(ReviewService.name);
  async createReview(createReviewDto: CreateReviewDto, user: User) {
    try {
      createReviewDto.userId = user.id;
      return await this.reviewRepository.save({ ...createReviewDto, user });
    } catch (error) {
      this.logger.error('Failed to create review', error.stack);
      throw new BadRequestException(
        'Could not create review. Please try again later.',
      );
    }
  }

  async findAllAndCount(data?: FindManyReviewDto): Promise<[Review[], number]> {
    const order: FindOptionsOrder<any> = {};
    if (data.directionToSort) {
      order[data.sortField] = data.directionToSort;
    }

    return await this.reviewRepository.findAndCount({
      where: {},
      take: data.take,
      skip: data.skip,
      order: order,
    });
  }

  async findAll(paginateAndSort?: FindManyReviewDto) {
    const now = new Date();
    let whereCondition: any = {};

    // Specific field to filter by time period
    const dateField = 'createdAt';

    switch (paginateAndSort.timePeriod) {
      case 'today':
        whereCondition[dateField] = Between(startOfDay(now), endOfDay(now));
        break;
      case 'week':
        whereCondition[dateField] = Between(startOfWeek(now), endOfWeek(now));
        break;
      case 'month':
        whereCondition[dateField] = Between(startOfMonth(now), endOfMonth(now));
        break;
      case 'year':
        whereCondition[dateField] = Between(startOfYear(now), endOfYear(now));
        break;
      default:
        whereCondition = {};
    }

    if (paginateAndSort.rating) {
      whereCondition = { ...whereCondition, rating: paginateAndSort.rating };
    }

    const [review, total] = await this.reviewRepository.findAndCount({
      where: whereCondition,
      take: paginateAndSort.take,
      skip: paginateAndSort.skip,
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });

    const averageRating = await this.aggregateReview();

    return [review, total, averageRating.toPrecision(2)];
  }

  async findOne(id: string) {
    try {
      return await this.reviewRepository.findOneOrFail({
        where: { id },
        relations: ['user'],
        select: {
          user: {
            id: true,
            firstName: true,
            lastName: true,
            arabicFirstName: true,
            arabicLastName: true,
            language: true,
          },
        },
      });
    } catch (error) {
      this.logger.log(AppStrings.NOT_FOUND);
      throw new NotFoundException(AppStrings.NOT_FOUND);
    }
  }

  async aggregateReview() {
    const [sum, count] = await Promise.all([
      this.reviewRepository.sum('rating'),
      this.reviewRepository.count(),
    ]);

    const averageRating = sum / count;

    return averageRating;
  }

  async searchForReview(searchParam: string) {
    try {
      const queryBuilder = this.reviewRepository
        .createQueryBuilder('review')
        .leftJoinAndSelect('review.user', 'user')

        // Search by user name
        .orWhere('user.name ILIKE :term', { term: `%${searchParam}%` })

        // Search by rating if searchParam is numeric
        .orWhere('review.rating = :rating', {
          rating: !isNaN(Number(searchParam)) ? Number(searchParam) : undefined,
        })

        // Search by service name
        .orWhere('review.service ILIKE :term', { term: `%${searchParam}%` })

        .take(10);

      return await queryBuilder.getMany();
    } catch (error) {
      this.logger.error(error.message);
      throw new BadRequestException(
        'An error occurred while searching for reviews.',
      );
    }
  }
}
