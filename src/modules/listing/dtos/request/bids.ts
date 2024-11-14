/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsPositive, IsString } from 'class-validator';
@InputType()
export class CreateBidInput {
  userId: string;

  bidNumber: number;

  @Field()
  @IsNumber()
  @IsPositive()
  price: number;

  @Field()
  @IsString()
  auctionId: string;

  @Field()
  @IsString()
  listingId: string;

  @Field()
  @IsString()
  reference: string;
}
@InputType()
export class BidRegistrationInput {
  @Field()
  @IsString()
  userId: string;

  @Field()
  @IsString()
  auctionId: string;

  @Field()
  @IsString()
  listingId: string;

  @Field()
  @IsString()
  reference: string;
}

@InputType()
export class FindBidInput {
  @Field()
  @IsString()
  auctionId: string;

  @Field()
  @IsString()
  listingId: string;
}
