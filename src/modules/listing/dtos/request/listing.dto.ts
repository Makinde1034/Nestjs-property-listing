/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType, PartialType } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,

  IsNumberString,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import {
  ListingFlagType,
  Ownership,
  Purpose,
  RentingOption,
} from '../../../../common/enums';

import { PaginateAndSort } from '../../../core/dto/pagination-and-sort.dto';
import { TimePeriod } from '../../../../common/enums/sort.enum';
import { LocationDto } from '../../../location/dto/request/location.dto';

@InputType()
export class Attributes {
  @Field()
  @IsString()
  value: string;

  @Field()
  @IsString()
  attributeId: string;
}

@InputType()
export class CreateListingDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsEnum(Purpose)
  purpose: string;

  @Field()
  @IsPositive()
  price: number;

  @Field()
  @IsEnum(Ownership)
  ownership: string;

  @ValidateIf((listing) => listing.ownership == 'power_of_attorney')
  @IsNotEmpty({
    message: 'poaNumber field is required for power_of_attorney ownership',
  })
  @Field({ nullable: true })
  @IsNumberString()
  poaNumber: string;

  @Field({ nullable: true })
  @IsNumberString()
  deedNumber: string;

  @ValidateIf((listing) => listing.purpose == 'rent')
  @IsNotEmpty({
    message: 'rentingOption field is required for purpose of rent',
  })
  @Field({ nullable: true })
  @IsEnum(RentingOption)
  rentingOption: string;

  @Field()
  @IsNumberString()
  iban: string;

  @Field()
  @IsNumberString()
  zatcaNumber: string;

  @Field()
  @IsString()
  listingTypeId: string;

  @Field(() => [Attributes])
  @IsArray()
  attributes: Attributes[];

  @Field({ nullable: true })
  @IsObject()
  gpsCoordinate: LocationDto;

  @Field(() => [String], { nullable: true })
  panoramaView: string[];

  @Field({ defaultValue: false, nullable: true })
  @IsBoolean()
  negotiable: boolean;

  userId?: string;
}

@InputType()
export class UpdateListingDto extends PartialType(CreateListingDto) {
  @Field()
  @IsUUID()
  id: string;
}

@InputType()
export class UpdateListingAdminDto extends PartialType(CreateListingDto) {
  @Field()
  @IsUUID()
  id: string;
}

@InputType()
export class FlagListingInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  listingId: string;

  @Field()
  @IsEnum(ListingFlagType)
  parentIssue: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  childIssue: string;
}

@InputType()
export class UserFilterAndSort extends PaginateAndSort {
  @Field({ defaultValue: false })
  @IsOptional()
  @IsEnum(TimePeriod)
  timePeriod: string;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isListinPromoted: boolean;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isListingSold: boolean;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isListingFlagged: boolean;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isListingRented: boolean;
}

@InputType()
export class AdminFilterAndSort extends UserFilterAndSort {}
