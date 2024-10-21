/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, InputType } from '@nestjs/graphql';

import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

@InputType()
export class InitiatePaymentInput {
  @Field({ nullable: true })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @Field({ nullable: true })
  @IsOptional()
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
export class PaymentRequest {
  entityId: string;
  amount: number;
  currency: string;
  paymentType: string;
  integrity: boolean;
  customer: Customer;

  merchantTransactionId: string;
  paymentBrand: string;
}

export class Customer {
  email: string;
  givenName: string;
  surname: string;
  city: string;
  country: string;
}

export class RefundPaymentRequest {
  entityId: string;
  amount: number;
  currency: string;
  paymentType: string;
  merchantTransactionId: string;
  paymentBrand: string;
  card: Card;
}
@InputType()
export class PreAuthorisedPaymentInput {
  @Field()
  @IsPositive()
  Amount: number;

  @Field()
  @IsString()
  PaymentBrand: string;

  @Field()
  @IsString()
  CardNumber: string;

  @Field()
  @IsString()
  CardHolder: string;

  @Field()
  @IsString()
  CardExpiryMonth: string;

  @Field()
  @IsString()
  CardExpiryYear: string;

  @Field()
  @IsString()
  CardCvv: string;

  PaymentType?: string;
  EntityId?: string;
  Currency?: string;
}

export interface DebitPaymentResponse {
  Id: string;
  PaymentType: string;
  PaymentBrand: string;
  Result: Result;
  Card: Card;
  BuildNumber: string;
  Timestamp: string;
  Ndc: string;
}

export interface Card {
  holder: string;
  expiryMonth: string;
  expiryYear: string;
  number: string;
  cvv: string;
}

export interface Result {
  Code: string;
  Description: string;
}

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
export interface CapturePaymentData {
  amount: string;
  paymentId: string;
}
