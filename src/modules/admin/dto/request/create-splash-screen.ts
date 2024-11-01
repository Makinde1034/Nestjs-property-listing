/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsBoolean, IsDate, IsEnum, IsNumber, IsString } from 'class-validator';
import { SplashScreenPlacement } from '../../../../common/enums/splashScreen';
@InputType()
export class CreateSplashScreenInput {
  @Field()
  @IsBoolean()
  default: boolean;

  @Field()
  @IsEnum(SplashScreenPlacement)
  placement: string;

  @Field()
  @IsString()
  title: string;

  @Field()
  @IsDate()
  startDate: Date;

  @Field()
  @IsDate()
  endDate: Date;
}

@InputType()
export class UpdateSplashScreenInput extends PartialType(
  CreateSplashScreenInput,
) {
  @Field()
  @IsNumber()
  id: number;
}
