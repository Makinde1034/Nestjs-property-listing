/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { PaginateAndSort } from '../../../core/dto/pagination-and-sort.dto';
import { FurnishingStatusEnum } from '../../../../common/enums';
@InputType()
export class CreateSearchHistoryInput extends PaginateAndSort {
  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  location: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  minPrice: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  maxPrice: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  minArea: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  maxArea: string;

  @IsOptional()
  @IsString()
  @Field(() => [String], { nullable: true })
  numberOfBathrooms: string[];

  @IsOptional()
  @IsString()
  @IsEnum(FurnishingStatusEnum)
  @Field({ nullable: true })
  furnishing: string;

  @IsOptional()
  @IsString()
  @Field(() => [String], { nullable: true })
  numberOfRooms: string[];

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  floor: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  type: string;

  @IsOptional()
  @Field({ nullable: true })
  @IsString()
  listingType: string;
}
