/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  ValidateIf,
} from 'class-validator';

@InputType()
export class CreateOfferDto {
  @Field()
  @IsPositive()
  @IsNotEmpty()
  offerPrice: number;

  @Field()
  @IsDate()
  @IsNotEmpty()
  expireAt: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  coupon: boolean;

  @Field({ nullable: true })
  @ValidateIf((o) => o.coupon === true)
  @IsString()
  @IsNotEmpty()
  couponCode: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  listingId: string;

  userId?: string;
}
