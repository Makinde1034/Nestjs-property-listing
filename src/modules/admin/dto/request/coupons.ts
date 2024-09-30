/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType, PartialType } from '@nestjs/graphql';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';
import { CouponEnum } from '../../../../common/enums/coupons.enum';

@InputType()
export class CreateCouponInput {
  @Field()
  @IsNumber()
  maxUse: number;

  @Field()
  @IsEnum(CouponEnum)
  discountType: string;

  @Field()
  @IsNumber()
  @IsPositive()
  discountValue: number;

  @Field()
  @IsDate()
  startDate: Date;

  @Field()
  @IsDate()
  endDate: Date;
}

@InputType()
export class UpdateCouponInput extends PartialType(CreateCouponInput) {
  @Field()
  @IsString()
  id: string;
}

@InputType()
export class DeactivateCouponInput {
  @Field(() => [String])
  @IsArray()
  id: string[];
}

@InputType()
export class DeleteCouponInput {
  @Field(() => [String])
  @IsArray()
  id: string[];
}
