/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class ListingTypeDeleteInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  id: string;
}

@InputType()
export class ListingTypeInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  englishName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  arabicName: string;

  @Field(() => [String])
  @IsArray()
  @IsNotEmpty()
  attributeSets: string[];
}

@InputType()
export class ListingTypeUpdateInput extends PartialType(ListingTypeInput) {
  @Field()
  @IsString()
  @IsNotEmpty()
  id: string;
}
