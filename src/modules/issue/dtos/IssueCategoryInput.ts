/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType, PartialType } from '@nestjs/graphql';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { IssuePlacement } from '../../../common/enums';

@InputType()
export class DeleteIssueInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  id: string;
}

@InputType()
export class CreateIssueInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @IsEnum(IssuePlacement)
  placement: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  englishName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  arabicName: string;

  @Field()
  @IsNumber()
  @IsOptional()
  sequentialId: number;
}
@InputType()
export class CreateChildIssueInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  parentId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  englishName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  arabicName: string;

  @Field()
  @IsNumber()
  @IsOptional()
  sequentialId: number;
}
@InputType()
export class UpdateChildIssueInput extends PartialType(CreateChildIssueInput) {
  @Field()
  @IsString()
  @IsOptional()
  id: string;
}

@InputType()
export class UpdateIssueInput extends PartialType(CreateIssueInput) {
  @Field()
  @IsString()
  @IsNotEmpty()
  id: string;
}
