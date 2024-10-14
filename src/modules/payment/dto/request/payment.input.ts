/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@InputType()
export class InitiatePaymentInput {
  @Field({ nullable: true })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @Field({ nullable: true })
  @IsNotEmpty()
  @IsString()
  coupon: string;
}

@InputType()
export class VerifyPaymentInput {
  @Field({ nullable: true })
  @IsNotEmpty()
  @IsString()
  checkoutId: string;
}

export class PerformCopyAndPayInput {
  entityId: string;
  amount: string;
  currency: string;
  shopperUrl?: string;
  paymentType: string;
}

// @InputType()
// Export class PreAuthorisedPaymentInput {
//   @Field()
//   @IsPositive()
//   Amount: number;

//   @Field()
//   @IsString()
//   PaymentBrand: string;

//   @Field()
//   @IsString()
//   CardNumber: string;

//   @Field()
//   @IsString()
//   CardHolder: string;

//   @Field()
//   @IsString()
//   CardExpiryMonth: string;

//   @Field()
//   @IsString()
//   CardExpiryYear: string;

//   @Field()
//   @IsString()
//   CardCvv: string;

//   PaymentType?: string;
//   EntityId?: string;
//   Currency?: string;
// }

// Export interface DebitPaymentResponse {
//   Id: string;
//   PaymentType: string;
//   PaymentBrand: string;
//   Result: Result;
//   Card: Card;
//   BuildNumber: string;
//   Timestamp: string;
//   Ndc: string;
// }

// Export interface Card {
//   Bin: string;
//   Last4Digits: string;
//   Holder: string;
//   ExpiryMonth: string;
//   ExpiryYear: string;
// }

// Export interface Result {
//   Code: string;
//   Description: string;
// }

export interface CheckoutResponse {
  id: string;

  result: Result;
  buildNumber: string;
  timestamp: string;
  ndc: string;
}

export interface Result {
  code: string;
  description: string;
}
