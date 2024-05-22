/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Review } from '../../../entities';

@ObjectType()
export class ReviewResponse {
  @Field(() => [Review])
  reviews: Review[];

  @Field(() => Int)
  total: number;
}
