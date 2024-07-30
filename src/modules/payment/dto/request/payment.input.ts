/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { IsPositive, IsString } from 'class-validator';

@InputType()
export class PreAuthorisedPaymentInput {
  @Field()
  @IsPositive()
  amount: number;

  @Field()
  @IsString()
  paymentBrand: string;

  @Field()
  @IsString()
  cardNumber: string;

  @Field()
  @IsString()
  cardHolder: string;

  @Field()
  @IsString()
  cardExpiryMonth: string;

  @Field()
  @IsString()
  cardExpiryYear: string;

  @Field()
  @IsString()
  cardCvv: string;

  paymentType?: string;
  entityId?: string;
  currency?: string;
}
