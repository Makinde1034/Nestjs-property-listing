/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

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

export interface PreAuthorisedPaymentResult {
  code: string;
  description: string;
}
