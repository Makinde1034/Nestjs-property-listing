/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ReviewRepository } from '../repository/review.repository';
import { CreateReviewDto } from '../dto/create-review.dto';
import { User } from '../../../entities';
import { UserRepository } from '../../user/repositories';
import { AppStrings } from '../../../common/messages/app.strings';

@Injectable()
export class ReviewService {
  constructor(
    private reviewRepository: ReviewRepository,
    private userRepository: UserRepository,
  ) {}
  logger = new Logger(ReviewService.name);
  async createReview(createReviewDto: CreateReviewDto, user: User) {
    const serviceOwner = await this.userRepository.findById(
      createReviewDto.service_owner_id,
    );
    if (!serviceOwner) {
      throw new BadRequestException(AppStrings.SERVICE_OWNER_NOT_FOUND);
    }
    try {
      createReviewDto.reviewer_id = user.id;
      const serviceOwnerUser = await this.userRepository.findByIdOrFail(
        createReviewDto.service_owner_id,
      );
      if (!serviceOwnerUser) {
        throw new BadRequestException(AppStrings.SERVICE_OWNER_NOT_FOUND);
      }
      return await this.reviewRepository.create(createReviewDto);
    } catch (error) {
      this.logger.error('Failed to create review', error.stack);
      throw new Error('Could not create review. Please try again later.');
    }
  }
}
