/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { ServicesOffered } from '../../../common/enums';
import { FindOptionsWhere } from 'typeorm';
import { Type } from 'class-transformer';

import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';

@InputType({})
export class FindManyReviewDto extends PaginateAndSort {
  @Field(() => WhereCondition, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => WhereCondition)
  where?: FindOptionsWhere<any>;
}
@InputType()
class WhereCondition {
  @Field(() => ServicesOffered, { nullable: true })
  @IsOptional()
  @IsEnum(ServicesOffered)
  service?: ServicesOffered;

  // Add more fields as necessary
}
