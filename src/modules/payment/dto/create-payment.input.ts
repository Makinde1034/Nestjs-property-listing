/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { IsPositive } from 'class-validator';

@InputType()
export class CreatePaymentInput {
  @Field()
  @IsPositive()
  amount: number;
}
