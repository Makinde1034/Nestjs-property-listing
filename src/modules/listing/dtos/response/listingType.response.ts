/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ListingType } from '../../../../entities';

@ObjectType()
export class ListingTypesResponse {
  @Field(() => [ListingType])
  listingType: ListingType[];

  @Field(() => Int)
  total: number;
}
