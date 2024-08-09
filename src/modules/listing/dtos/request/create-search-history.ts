/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { PaginateAndSort } from '../../../core/dto/pagination-and-sort.dto';
import { RentingOption } from '../../../../common/enums';
import { Attributes } from './listing.dto';
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
  @IsNumber()
  @Field({ nullable: true })
  minArea: number;

  @IsOptional()
  @IsNumber()
  @Field({ nullable: true })
  maxArea: number;

  // @IsOptional()
  // @Field(() => [String], { nullable: true })
  // NumberOfBathrooms: string[];

  @IsOptional()
  @Field(() => [Attributes], { nullable: true })
  attributes: Attributes[];

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  type: string;

  @IsOptional()
  @IsString()
  @IsEnum(RentingOption)
  @Field({ nullable: true })
  rentingOption: string;

  @IsOptional()
  @Field({ nullable: true })
  @IsString()
  listingId: string;
}
