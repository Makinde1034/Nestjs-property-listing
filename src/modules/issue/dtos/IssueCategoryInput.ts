/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateIssueCategoryInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;
}

@InputType()
export class UpdateIssueCategoryInput extends CreateIssueCategoryInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  id: string;
}

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
  categoryId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  parentReason: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  parentArabicReason: string;

  @Field()
  @IsNumber()
  @IsOptional()
  sequentialId: number;
}

@InputType()
export class UpdateIssueInput extends PartialType(CreateIssueInput) {
  @Field()
  @IsString()
  @IsNotEmpty()
  id: string;
}
