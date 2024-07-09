/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType, PartialType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { PaginateAndSort } from '../../../core/dto/pagination-and-sort.dto';

@InputType()
export class CreateOfferDto {
  @Field()
  @IsPositive()
  @IsNotEmpty()
  offerPrice: number;

  @Field({ nullable: true })
  @IsDate()
  expireAt: Date;

  @Field({ nullable: true })
  @IsOptional()
  // @IsEnum(StatusListEnum)
  status: string;

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

@InputType()
export class UpdateOfferInput extends PartialType(CreateOfferDto) {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

@InputType()
export class FindOfferInput extends PaginateAndSort {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  listingId: string;
}
