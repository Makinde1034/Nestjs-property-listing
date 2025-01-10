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
import { Optional } from '@nestjs/common';
import { OfferListEnum } from '../../../../common/enums/status.enum';
import { ListingStage } from '../../../../common/enums';

@InputType()
export class AdminDashboardSort extends PaginateAndSort {
  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(TimePeriod)
  timePeriod: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  value: number;
}

@InputType()
export class AdminDashboardListingStatus extends AdminDashboardSort {
  @Field({ nullable: true })
  @IsEnum(ListingStage)
  @IsOptional()
  stage: string;

  @Field({ nullable: true })
  @IsEnum(OfferListEnum)
  @IsOptional()
  status: string;
}

@InputType()
export class AdminDefaultInput {
  @Field()
  @IsNumber()
  minimumOfferPercentage: number;

  @Field()
  @IsString()
  paymentType: string;

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
  @IsOptional()
  @IsEnum(TimePeriod)
  @Field({ nullable: true })
  timePeriod: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  placement: string;
}

@InputType()
export class BidRange {
  @IsString()
  @Field()
  id: string;
  @IsString()
  @Field({ nullable: true })
  @Optional()
  bidIncrement: number;
  @IsString()
  @Field({ nullable: true })
  @Optional()
  heldAmount: number;
}
