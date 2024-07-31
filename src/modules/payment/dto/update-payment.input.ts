/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';
import { PreAuthorisedPaymentInput } from './request/payment.input';
import { PartialType } from '@nestjs/mapped-types';
@InputType()
export class UpdatePaymentInput extends PartialType(PreAuthorisedPaymentInput) {
  @Field()
  id: string;
}
