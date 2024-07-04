/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsDate, IsNumber, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateAuctionInput {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  description: string;

  @Field()
  @IsDate()
  startDate: Date;

  @Field()
  @IsNumber()
  liveFor: number;

  @Field()
  @IsNumber()
  maxListing: number;
}

@InputType()
export class UpdateAuctionInput extends PartialType(CreateAuctionInput) {
  @Field()
  @IsUUID()
  id: string;
}

@InputType()
export class CreateAuctionParticipantInput {
  @Field()
  @IsUUID()
  auctionId: string;

  @Field()
  @IsUUID()
  listingId: string;
}
