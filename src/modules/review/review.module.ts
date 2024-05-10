/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Module } from '@nestjs/common';
import { ReviewResolver } from './resolvers';
import { ReviewService } from './services';

@Module({
  imports: [],
  providers: [ReviewResolver, ReviewService],
})
export class ReviewModule {}
