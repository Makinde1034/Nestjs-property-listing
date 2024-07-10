/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import { Review } from '../../../entities';

@ObjectType()
export class ReviewResponse {
  @Field(() => [Review])
  reviews: Review[];

  @Field()
  total: number;

  @Field()
  averageRating: string;
}
