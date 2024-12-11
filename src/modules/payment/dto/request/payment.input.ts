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
  testMode?: string;

  merchantTransactionId: string;
  'customParameters[3DS2_enrolled]'?: boolean;
  'customParameters[3DS2_flow]'?: string;
}

export class RefundPaymentRequest {
  entityId: string;
  amount: number;
  currency: string;
  paymentType: string;
  merchantTransactionId: string;
  paymentBrand: string;
  'card.number': string;
  'card.holder': string;
  'card.expiryMonth': string;
  'card.expiryYear': string;
  'card.cvv': string;
}

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

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  coupon: string;

  @Field()
  @IsString()
  cardExpiryMonth: string;

  @Field()
  @IsString()
  cardExpiryYear: string;

  @Field()
  @IsString()
  cardCvv: string;
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
@InputType()
export class CapturePaymentData {
  @Field()
  amount: string;
  @Field()
  paymentId: string;
}

export interface RefundPaymentData {
  amount: string;
  paymentId: string;
}
