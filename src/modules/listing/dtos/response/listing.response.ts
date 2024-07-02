/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Listing } from '../../../../entities';
import { FlagListing } from '../../../../entities/flag-listing.entity';

@ObjectType()
export class ListingResponse {
  @Field(() => [Listing])
  listing: Listing[];

  @Field(() => Int)
  total: number;
}

@ObjectType()
export class FlaggedListingResponse {
  @Field(() => [FlagListing], { nullable: true })
  flaggedListing: FlagListing[];

  @Field(() => Int)
  total: number;
}

@ObjectType()
export class ListingAnalysisResponse {
  @Field()
  flagged: number;
  @Field()
  promoted: number;
  @Field()
  sold: number;
}

@ObjectType()
export class AdminListingResponse {
  @Field(() => [Listing], { nullable: true })
  listing: Listing[];

  @Field(() => ListingAnalysisResponse)
  analysis: ListingAnalysisResponse;

  @Field(() => Int)
  total: number;
}
