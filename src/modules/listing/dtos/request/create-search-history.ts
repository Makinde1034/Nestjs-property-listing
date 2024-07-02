/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ListingType, Purpose } from '../../../../common/enums';

import { PaginateAndSort } from '../../../core/dto/pagination-and-sort.dto';
@InputType()
export class CreateSearchHistoryInput extends PaginateAndSort {
  @IsOptional()
  @IsString()
  @Field()
  location: string;

  @IsOptional()
  @IsString()
  @Field()
  price: string;

  @IsOptional()
  @IsString()
  @Field()
  numberOfBathrooms: string;
  @IsOptional()
  @IsString()
  @Field()
  numberOfRooms: string;

  @IsString()
  @Field()
  @IsEnum(Purpose)
  type: string;

  @IsOptional()
  @Field()
  @IsString()
  @IsEnum(ListingType)
  listingType: string;
}
