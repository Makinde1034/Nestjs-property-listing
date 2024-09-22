/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';

import {
  IsOptional,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

import { SortOrder } from '../../../common/enums';

import { WhereOption } from './where-option.dto';

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
  @Field({ nullable: true })
  sortField?: string;

  @IsOptional()
  @IsString()
  @Field(() => SortOrder, { nullable: true })
  directionToSort?: string;

  @IsOptional()
  @Field({ nullable: true })
  @ValidateNested()
  where: WhereOption;
}
