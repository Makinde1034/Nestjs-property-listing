/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { InputType, Field, PartialType } from '@nestjs/graphql';
import {
  IsOptional,
  IsEnum,
  IsNumber,
  IsString,
  IsArray,
} from 'class-validator';
import { TimePeriod } from '../../../../common/enums/sort.enum';
import { PaginateAndSort } from '../../../core/dto/pagination-and-sort.dto';

@InputType()
export class AdminDashboardSort extends PaginateAndSort {
  @Field({ defaultValue: false })
  @IsOptional()
  @IsEnum(TimePeriod)
  timePeriod: string;

  @Field({ defaultValue: false, nullable: true })
  @IsOptional()
  value: number;
}

@InputType()
export class AdminDefaultInput {
  @Field()
  @IsNumber()
  minimumOfferPercentage: number;

  // @Field()
  // @IsNumber()
  // minBidRange: number;

  // @Field()
  // @IsNumber()
  // bidIncrement: number;

  // @Field()
  // @IsNumber()
  // maxBidRange: number;

  @Field()
  @IsString()
  paymentType: string;

  // @Field()
  // @IsString()
  // bidIncrementId: string;

  @Field()
  @IsNumber()
  saiiForSale: number;

  @Field()
  @IsNumber()
  saiiForRent: number;

  @Field()
  @IsNumber()
  dataRetention: number;

  @Field()
  @IsNumber()
  ratingPrompt: number;

  @Field()
  @IsNumber()
  ticketAging: number;

  // @Field()
  // @IsNumber()
  // auctionHeldAmount: number;

  @Field()
  @IsNumber()
  vat: number;

  @Field()
  @IsNumber()
  daysToAuctionRegistrationStart: number;

  @Field()
  @IsNumber()
  daysToAuctionRegistrationEnd: number;

  @Field()
  @IsString()
  postcode: string;

  @Field()
  @IsString()
  merchantTransactionId: string;

  @Field()
  @IsString()
  street: string;

  @Field()
  @IsString()
  city: string;

  @Field()
  @IsString()
  state: string;

  @Field()
  @IsString()
  country: string;

  @Field()
  @IsString()
  countryISOCode: string;
}

@InputType()
export class UpdateAdminDefaultInput extends PartialType(AdminDefaultInput) {
  @Field(() => [BidRange], { nullable: true })
  @IsOptional()
  @IsArray()
  bidRange: BidRange[];
}

@InputType()
export class DeleteSplashScreenInput {
  @IsArray()
  @Field(() => [String])
  id: string[];
}

@InputType()
export class SplashScreenFilterInput extends PaginateAndSort {
  @IsEnum(TimePeriod)
  @Field()
  timePeriod: string;

  @IsString()
  @Field()
  placement: string;
}
@InputType()
export class BidRange {
  @IsString()
  @Field()
  id: string;
  @IsString()
  @Field()
  bidIncrement: number;
  @IsString()
  @Field()
  heldAmount: number;
}
