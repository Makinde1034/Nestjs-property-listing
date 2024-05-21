/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { ReviewService } from '../services';
import { Review } from '../../../entities';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guards';

@Resolver()
export class ReviewResolver {
  constructor(private reviewService: ReviewService) {}
  @Mutation(() => Review, { name: 'review' })
  @UseGuards(AccessTokenGuard)
  async createReview(
    @Context() ctx: any,
    @Args('createReviewDto') createReviewDto: CreateReviewDto,
  ) {
    return await this.reviewService.createReview(createReviewDto, ctx.req.user);
  }
}
