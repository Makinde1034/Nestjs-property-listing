/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { IsNumber, IsPositive, IsString } from 'class-validator';
@InputType()
export class CreateAutoBidInput {
  @Field()
  @IsNumber()
  @IsPositive()
  price: number;

  @Field()
  @IsString()
  listingId: string;

  @Field()
  @IsString()
  auctionId: string;

  @Field()
  @IsString()
  reference: string;
}
