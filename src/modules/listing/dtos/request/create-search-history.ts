/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { PaginateAndSort } from '../../../core/dto/pagination-and-sort.dto';
import { FurnishingStatusEnum } from '../../../../common/enums';
@InputType()
export class CreateSearchHistoryInput extends PaginateAndSort {
  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  location: string;

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

  @IsOptional()
  @Field(() => [String], { nullable: true })
  numberOfBathrooms: string[];

  @IsOptional()
  @IsString()
  @IsEnum(FurnishingStatusEnum)
  @Field({ nullable: true })
  furnishing: string;

  @IsOptional()
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
  listingId: string;
}
