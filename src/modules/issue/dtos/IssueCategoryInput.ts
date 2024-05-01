/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { IssuePlacement } from 'src/common/enums';

@InputType()
export class CreateIssueCategoryInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsEnum(IssuePlacement)
  @IsNotEmpty()
  placement: IssuePlacement;
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
  issue: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  categoryId: string;
}

@InputType()
export class UpdateIssueInput extends CreateIssueInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  id: string;
}
