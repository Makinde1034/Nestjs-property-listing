/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */
import { Field, InputType, PartialType } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import { PaginateAndSort } from '../../../core/dto/pagination-and-sort.dto';
import { Optional } from '@nestjs/common';

@InputType()
export class CreateWorkflowInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  document: string;

  @Field()
  @IsString()
  action: string;

  @Field()
  @IsBoolean()
  isActive: boolean;

  @Field()
  @IsNumber()
  numberOfApproval: number;

  @Field(() => [String])
  @IsArray()
  approvalOneRole: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @Optional()
  approvalTwoRole: string[];
}

@InputType()
export class UpdateWorkflowInput extends PartialType(CreateWorkflowInput) {
  @Field()
  @IsString()
  id: string;
}

@InputType()
export class ActionsInput {
  @Field(() => [String])
  @IsArray()
  id: string[];
}

@InputType()
export class Actions {
  @Field(() => [Number])
  @IsArray()
  id: number[];
}
@InputType()
export class WorkflowActionInput {
  @Field(() => [String])
  @IsArray()
  id: string[];

  @Field()
  @IsBoolean()
  isActive: boolean;
}

@InputType()
export class WorkflowInputFilter extends PaginateAndSort {
  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}
@InputType()
export class SystemFeature {
  @Field()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}

@InputType()
export class SystemFeatureSettingInput {
  @Field(() => [SystemFeature])
  @IsArray()
  SystemFeatureSetting: SystemFeature[];
}
