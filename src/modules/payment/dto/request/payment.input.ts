/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { IsString } from 'class-validator';

export class InitiatePaymentInput {
  entityId?: string;
  @IsString()
  amount: string;
  currency?: string;

  paymentType?: string;
}

export class PerformCopyAndPayInput {
  entityId: string;
  amount: string;
  currency: string;
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
