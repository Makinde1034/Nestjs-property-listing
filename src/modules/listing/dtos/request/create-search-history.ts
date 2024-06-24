/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsString } from 'class-validator';
import { ListingType, Purpose } from '../../../../common/enums';

import { PaginateAndSort } from '../../../core/dto/pagination-and-sort.dto';
@InputType()
export class CreateSearchHistoryInput extends PaginateAndSort {
  @IsString()
  @Field()
  location: string;

  @IsString()
  @Field()
  price: string;

  @IsString()
  @Field()
  numberOfBathrooms: string;

  @IsString()
  @Field()
  numberOfRooms: string;

  @IsString()
  @Field()
  @IsEnum(Purpose)
  type: string;

  @Field()
  @IsString()
  @IsEnum(ListingType)
  listingType: string;
}
