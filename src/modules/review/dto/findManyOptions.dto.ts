/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ServicesOffered, SortOrder } from '../../../common/enums';
import { FindOptionsWhere } from 'typeorm';
import { Type } from 'class-transformer';

import { OrderBYEnum } from '../../../common/enums/sort.enum';

@InputType({})
export class FindManyReviewDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  take: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  skip: number;

  @Field(() => WhereCondition, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => WhereCondition)
  where?: FindOptionsWhere<any>;

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
@InputType()
class WhereCondition {
  @Field(() => ServicesOffered, { nullable: true })
  @IsOptional()
  @IsEnum(ServicesOffered)
  service?: ServicesOffered;

  // Add more fields as necessary
}
