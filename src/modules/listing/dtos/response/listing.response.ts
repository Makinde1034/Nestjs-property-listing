/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Listing } from '../../../../entities';

@ObjectType()
export class ListingResponse {
  @Field(() => [Listing])
  listing: Listing[];

  @Field(() => Int)
  total: number;
}
