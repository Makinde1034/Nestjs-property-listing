/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { AttributeType } from 'src/common/enums';

@InputType()
export class AttributeInput {
  @Field({ nullable: true })
  @ValidateIf((attribute) => attribute.arablicName === null)
  @IsString()
  @IsNotEmpty()
  englishName: string;

  @Field({ nullable: true })
  @ValidateIf((attribute) => attribute.englishName === null)
  @IsString()
  @IsNotEmpty()
  arabicName: string;

  @Field()
  @IsEnum(AttributeType)
  @IsNotEmpty()
  type: AttributeType;

  @Field()
  @IsBoolean()
  @IsNotEmpty()
  isRequired: boolean;

  @Field()
  @IsBoolean()
  @IsNotEmpty()
  showInSummary: boolean;

  @Field()
  @IsBoolean()
  @IsNotEmpty()
  hiddenToBuyers: boolean;

  @Field()
  @IsBoolean()
  @IsNotEmpty()
  showInComparison: boolean;

  @Field()
  @IsBoolean()
  @IsNotEmpty()
  showInFilters: boolean;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  dropDownOptions: string[];
}

@InputType()
export class AttributeUpdateInput extends AttributeInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  id: string;
}

@InputType()
export class AttributeDeleteInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  id: string;
}

@InputType()
export class AttributeSetInput {
  @Field({ nullable: true })
  @ValidateIf((attribute) => attribute.arablicName === null)
  @IsString()
  @IsNotEmpty()
  englishName: string;

  @Field({ nullable: true })
  @ValidateIf((attribute) => attribute.englishName === null)
  @IsString()
  @IsNotEmpty()
  arabicName: string;

  @Field(() => [String])
  @IsArray()
  @IsNotEmpty()
  attributes: string[];
}

@InputType()
export class AttributeSetUpdateInput extends AttributeSetInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  id: string;
}
