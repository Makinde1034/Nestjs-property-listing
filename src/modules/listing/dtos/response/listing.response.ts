/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Listing } from '../../../../entities';
import { FlagListing } from '../../../../entities/flag-listing.entity';
import { Offer } from '../../../../entities/offer.entity';
import { Auction } from '../../../../entities/auction-table.entity';
import { SearchHistory } from '../../../../entities/search-history.entity';
import { AuctionParticipant } from '../../../../entities/auction-participant.entity';

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

  @Field()
  rented: number;
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

@ObjectType()
export class OfferResponse {
  @Field(() => [Offer], { nullable: true })
  offer: Offer[];

  @Field(() => Listing)
  listing: Listing;

  @Field(() => Int)
  total: number;
}

@ObjectType()
export class OfferOwnerResponse {
  @Field(() => [Offer], { nullable: true })
  offer: Offer[];

  @Field()
  totalOfferOnlisting: number;

  @Field(() => Int)
  total: number;
}

@ObjectType()
export class AuctionResponse {
  @Field(() => [Auction])
  auctions: Auction[];

  @Field(() => Int)
  total: number;
}

@ObjectType()
export class AuctionParticipantResponse {
  @Field(() => Auction, { nullable: true })
  auctions: Auction;

  @Field(() => [AuctionParticipant], { nullable: true })
  participant: AuctionParticipant[];

  @Field(() => Int)
  total: number;
}

@ObjectType()
export class SearchHistoryResponse {
  @Field(() => [SearchHistory], { nullable: true })
  searchHistory: SearchHistory[];

  @Field(() => Int)
  total: number;
}
