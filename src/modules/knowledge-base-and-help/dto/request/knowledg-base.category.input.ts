/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType, PartialType } from '@nestjs/graphql';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginateAndSort } from '../../../core/dto/pagination-and-sort.dto';
import { knowledgeBasePlacement } from '../../../../common/enums/knowledge-base';

@InputType()
export class CreateCategoryInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  arabicName: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  englishName: string;
}
@InputType()
export class UpdateCategoryInput extends PartialType(CreateCategoryInput) {
  @Field()
  @IsNotEmpty()
  @IsNumber()
  id: number;
}

@InputType()
export class CategoryActionInput {
  @Field(() => [Number])
  @IsNotEmpty()
  @IsArray()
  id: number[];
}
@InputType()
export class CategoryFilterInput extends PaginateAndSort {}
