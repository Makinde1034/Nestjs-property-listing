/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
@InputType()
export class CreateAutoBidInput {
  @Field()
  @IsString()
  listingId: string;

  @Field()
  @IsString()
  auctionId: string;
}
