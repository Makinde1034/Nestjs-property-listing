/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { IsNumber, IsPositive, IsString } from 'class-validator';
@InputType()
export class CreateFeatureInput {
  @Field()
  @IsString()
  listingId: string;

  @Field()
  @IsString()
  adPackageId: string;

  @Field()
  @IsNumber()
  @IsPositive()
  duration: number;
}
