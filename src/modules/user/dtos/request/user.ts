/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { PaginateAndSort } from '../../../core/dto/pagination-and-sort.dto';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserLevelEnum } from '../../../../common/enums';
@InputType()
export class UserFilter extends PaginateAndSort {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsEnum(UserLevelEnum)
  level: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  status: string[];

  @Field()
  @IsOptional()
  @IsBoolean()
  isBlocked: boolean;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  type: string[];

  @Field(() => [Number], { nullable: true })
  @IsOptional()
  @IsArray()
  roles: number[];
}
