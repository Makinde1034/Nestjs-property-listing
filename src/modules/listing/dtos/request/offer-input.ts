/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType, PartialType } from '@nestjs/graphql';
import {
  IsArray,
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
export class FinalizationStatus {
  @Field()
  @IsString()
  id: string;

  @Field()
  @IsString()
  status: string;
}

@InputType()
export class OfferFinalizationInput {
  @Field(() => [FinalizationStatus])
  @IsArray()
  finalizationInput: FinalizationStatus[];
}

@InputType()
export class CreateOfferDto {
  @Field()
  @IsPositive()
  @IsNotEmpty()
  price: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNotEmpty()
  @IsDate()
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

  @Field()
  @IsString()
  @IsNotEmpty()
  reference: string;

  saiiFee: number;

  vat: number;

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
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  listingId: string;
}
