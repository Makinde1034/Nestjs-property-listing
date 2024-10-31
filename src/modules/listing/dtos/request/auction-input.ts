/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsArray, IsDate, IsNumber, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateAuctionInput {
  @Field()
  @IsString()
  titleInEnglish: string;

  @Field()
  @IsString()
  titleInArabic: string;

  @Field()
  @IsString()
  arabicDescription: string;

  @Field()
  @IsString()
  englishDescription: string;

  @Field()
  @IsDate()
  startDate: Date;

  @Field()
  @IsNumber()
  liveFor: number;

  @Field()
  @IsNumber()
  maxListing: number;

  @Field({ nullable: true })
  imageLink: string;
}

@InputType()
export class UpdateAuctionInput extends PartialType(CreateAuctionInput) {
  @Field()
  @IsUUID()
  id: string;
}

@InputType()
export class AuctionActionInput {
  @Field(() => [String])
  @IsArray()
  id: string[];
}

@InputType()
export class CreateAuctionParticipantInput {
  @Field()
  @IsNumber()
  minimumPrice: number;

  @Field()
  @IsUUID()
  auctionId: string;

  @Field()
  @IsUUID()
  listingId: string;
}
