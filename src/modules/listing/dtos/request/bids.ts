/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { IsNumber, IsPositive, IsString } from 'class-validator';
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
