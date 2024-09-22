/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { IsDate, IsString } from 'class-validator';
@InputType()
export class CreateFeatureInput {
  @Field()
  @IsString()
  listingId: string;

  @Field()
  @IsString()
  adPackageId: string;

  @Field()
  @IsDate()
  startDate: Date;

  @Field()
  @IsDate()
  endDate: Date;
}
