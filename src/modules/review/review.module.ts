/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Module } from '@nestjs/common';
import { ReviewResolver } from './resolvers';
import { ReviewService } from './services';
import { ReviewRepository } from './repository/review.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Review])],
  providers: [ReviewResolver, ReviewService, ReviewRepository],
})
export class ReviewModule {}
