/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional } from 'class-validator';
import { ServicesOffered } from '../../../common/enums';

import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';

@InputType({})
export class FindManyReviewDto extends PaginateAndSort {}
@InputType()
export class WhereCondition {
  @Field(() => ServicesOffered, { nullable: true })
  @IsOptional()
  @IsEnum(ServicesOffered)
  service?: ServicesOffered;

  // Add more fields as necessary
}
// "where": {
//     "fieldToChose": "sellingType",
//     "whereParam": "rent"
//   }
