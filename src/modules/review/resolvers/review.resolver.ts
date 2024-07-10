/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ReviewService } from '../services';
import { Review } from '../../../entities';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guards';
import { FindManyReviewDto } from '../dto/review.dto';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { ReviewResponse } from '../dto/review-response';

@Resolver()
export class ReviewResolver {
  constructor(private reviewService: ReviewService) {}

  /**
   *
   * @param ctx
   * @param createReviewDto
   * @returns {Review}
   */
  @Mutation(() => Review, { name: 'createReview' })
  @UseGuards(AccessTokenGuard)
  async createReview(
    @Context() ctx: any,
    @Args('createReviewDto') createReviewDto: CreateReviewDto,
  ) {
    return await this.reviewService.createReview(createReviewDto, ctx.req.user);
  }

  @Query(() => Review, { name: 'findOneReview' })
  @UseGuards(AccessTokenGuard, AdminGuard)
  async findOne(@Args('id') id: string) {
    return await this.reviewService.findOne(id);
  }
  @UseGuards(AccessTokenGuard, AdminGuard)
  @Query(() => ReviewResponse, { name: 'findManyReviews' })
  async findManyReviews(
    @Args('findMayOptions', { nullable: true })
    findManyOption?: FindManyReviewDto,
  ) {
    const [reviews, total, averageRating] =
      await this.reviewService.findAll(findManyOption);
    return { reviews, total, averageRating };
  }
}
