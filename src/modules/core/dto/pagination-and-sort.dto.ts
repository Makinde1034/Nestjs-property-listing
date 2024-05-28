/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';

import { IsOptional, IsNumber, IsString, IsEnum } from 'class-validator';

import { SortOrder } from '../../../common/enums';
import { OrderBYEnum } from '../../../common/enums/sort.enum';
@InputType()
export class PaginateAndSort {
  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  take: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  skip: number;

  @IsOptional()
  @IsString()
  @Field()
  @IsEnum(OrderBYEnum)
  sortField?: string;

  @IsOptional()
  @IsString()
  @Field()
  @IsEnum(SortOrder)
  direction_to_sort?: string;
}
