/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';

export interface CapturePaymentResponse {
  result: CapturePaymentData;
  buildNumber: string;
  timestamp: string;
  ndc: string;
}

export interface CapturePaymentData {
  code: string;
  description: string;
  parameterErrors: CapturePaymentError[];
}

export interface CapturePaymentError {
  name: string;
  value: null | string;
  message: string;
}

export interface PreAuthorisedPaymentResponse {
  id: string;
  paymentType: string;
  paymentBrand: string;
  result: PreAuthorisedPaymentResult;
  card: PreAuthorisedPaymentCard;
  buildNumber: string;
  timestamp: string;
  ndc: string;
}

export interface PreAuthorisedPaymentCard {
  bin: string;
  last4Digits: string;
  holder: string;
  expiryMonth: string;
  expiryYear: string;
}

export interface CapturePaymentResponse {
  id: string;
  referencedId: string;
  paymentType: string;
  result: CapturePaymentData;
  buildNumber: string;
  timestamp: string;
  ndc: string;
}

export interface CapturePaymentData {
  code: string;
  description: string;
}

export interface PreAuthorisedPaymentResult {
  code: string;
  description: string;
}

@ObjectType()
export class InitiatePaymentResponse {
  @Field(() => String, { nullable: true })
  checkoutId?: string;

  @Field(() => String, { nullable: true })
  referenceId?: string;

  @Field(() => String, { nullable: true })
  timeStamp?: string;
}

@ObjectType()
export class verifyPaymentResponse {
  @Field(() => String, { nullable: true })
  status: string;

  @Field()
  referenceId: string;

  @Field()
  message: string;
}
