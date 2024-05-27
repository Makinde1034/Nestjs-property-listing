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
import { UserRepository } from '../../user/repositories';
import { AppStrings } from '../../../common/messages/app.strings';
import { FindManyReviewDto } from '../dto/findManyOptions.dto';

import { FindOptionsOrder } from 'typeorm';

@Injectable()
export class ReviewService {
  constructor(
    private reviewRepository: ReviewRepository,
    private userRepository: UserRepository,
  ) {}
  logger = new Logger(ReviewService.name);
  async createReview(createReviewDto: CreateReviewDto, user: User) {
    try {
      const serviceOwnerUser = await this.userRepository.findById(
        createReviewDto.service_owner_id,
      );
      if (!serviceOwnerUser) {
        throw new BadRequestException(AppStrings.SERVICE_OWNER_NOT_FOUND);
      }
      createReviewDto.reviewer_id = user.id;

      return await this.reviewRepository.create(createReviewDto);
    } catch (error) {
      this.logger.error('Failed to create review', error.stack);
      throw new Error('Could not create review. Please try again later.');
    }
  }

  async findAllAndCount(data?: FindManyReviewDto): Promise<[Review[], number]> {
    const order: FindOptionsOrder<any> = {};
    if (data.direction_to_sort) {
      order[data.sortField] = data.direction_to_sort;
    }

    return await this.reviewRepository.findAndCount({
      where: {},
      take: data.take,
      skip: data.skip,
      order: order,
    });
  }

  async findAll(data?: FindManyReviewDto) {
    const order: FindOptionsOrder<any> = {};
    if (data.direction_to_sort) {
      order[data.sortField] = data.direction_to_sort;
    }

    return await this.reviewRepository.findAll({
      where: {},
      take: data.take,
      skip: data.skip,
      order: order,
    });
  }

  async findOne(id: string) {
    try {
      return await this.reviewRepository.findByIdOrFail(id);
    } catch (error) {
      this.logger.log(AppStrings.NOT_FOUND);
      throw new NotFoundException(AppStrings.NOT_FOUND);
    }
  }
}
