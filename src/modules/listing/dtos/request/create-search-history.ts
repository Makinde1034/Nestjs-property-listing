/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

import { PaginateAndSort } from '../../../core/dto/pagination-and-sort.dto';
import { Purpose, RentingOption } from '../../../../common/enums';
import { Attributes } from './listing.dto';
import { LocationDto } from '../../../location/dto/request/location.dto';

@InputType()
export class CreateSearchHistoryInput extends PaginateAndSort {
  @IsOptional()
  @IsNumber()
  @Field({ nullable: true })
  minPrice: number;

  @IsOptional()
  @IsNumber()
  @Field({ nullable: true })
  maxPrice: number;

  @IsOptional()
  @Field({ nullable: true })
  @IsEnum(Purpose)
  purpose: string;

  @IsOptional()
  @IsNumber()
  @Field({ nullable: true })
  minArea: number;

  @IsOptional()
  @IsNumber()
  @Field({ nullable: true })
  maxArea: number;

  @IsOptional()
  @IsObject()
  @Field({ nullable: true })
  gpsCoordinate: LocationDto;

  @IsOptional()
  @Field(() => [Attributes], { nullable: true })
  attributes: Attributes[];

  @IsOptional()
  @IsString()
  type: string;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  searchHistory: boolean;

  @IsOptional()
  @IsString()
  @IsEnum(RentingOption)
  @Field({ nullable: true })
  rentingOption: string;

  @IsOptional()
  @Field({ nullable: true })
  @IsString()
  listingTypeId: string;
}
