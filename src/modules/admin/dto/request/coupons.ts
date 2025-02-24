/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType, PartialType } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateIf,
} from 'class-validator';
import { CouponEnum } from '../../../../common/enums/coupons.enum';
import { CouponStatus } from '../../../../common/enums/status.enum';
import { AdminFilterAndSort } from '../../../listing/dtos/request';

@InputType()
export class CreateCouponInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  code: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'maxUse must be a number' }) // Ensure correct validation
  maxUse?: number; // Mark it as optional to align with `nullable: true`
  @Field()
  @IsBoolean()
  isActive: boolean;

  @Field()
  @IsString()
  appliedTo: string;

  @Field()
  @IsString()
  usage: string;

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

  @Field()
  @ValidateIf((o) => o.status)
  @IsEnum(CouponStatus)
  status: string;
}
@InputType()
export class CouponFilter extends AdminFilterAndSort {
  @Field()
  @IsEnum(CouponStatus)
  status: string;
}

@InputType()
export class ValidataCouponInput {
  @Field()
  @IsString()
  code: string;

  @Field()
  @IsNumber()
  @IsPositive()
  price: number;
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
