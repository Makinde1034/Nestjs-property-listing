/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';

import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { TimePeriod } from '../../../common/enums/sort.enum';

@InputType()
export class FindManyReviewDto extends PaginateAndSort {
  @Field()
  @IsNumber()
  rating: number;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsEnum(TimePeriod)
  timePeriod: string;
}
