/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { IsNumber, IsString } from 'class-validator';
@InputType()
export class CreateAutoBidInput {
  @Field()
  @IsString()
  listingId: string;

  @Field()
  @IsString()
  auctionId: string;

  @Field()
  @IsNumber()
  price: number;

  @Field()
  @IsString()
  reference: string;
}
