/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsBoolean, IsDate } from 'class-validator';
@InputType()
export class CreateSplashScreenInput {
  @Field()
  @IsBoolean()
  default: boolean;

  @Field()
  @IsDate()
  startDate: Date;

  @Field()
  @IsDate()
  endDate: Date;
}
export class UpdateSplashScreenInput extends PartialType(
  CreateSplashScreenInput,
) {
  @Field()
  id: string;
}
