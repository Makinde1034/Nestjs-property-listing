/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType, PartialType } from '@nestjs/graphql';
import {
  IsArray,
  IsDate,
  IsDateString,
  IsNumber,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { PaginateAndSort } from '../../../core/dto/pagination-and-sort.dto';

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
  @Min(4)
  @Max(24)
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
  @IsNumber()
  startingPrice: number;

  @Field()
  @IsUUID()
  auctionId: string;

  @Field()
  @IsUUID()
  listingId: string;

  @Field()
  @IsUUID()
  reference: string;
}

@InputType()
export class FetchAuctionParticipantInput extends PaginateAndSort {
  @Field()
  @IsString()
  id: string;
}
