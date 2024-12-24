/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

export interface WebHookPaymentResponse {
  type: string;
  payload: Payload;
}
export interface WebHookResponse {
  encryptedBody: string;
}

export interface Payload {
  id: string;
  paymentType: string;
  paymentBrand: string;
  amount: string;
  currency: string;
  presentationAmount: string;
  presentationCurrency: string;
  descriptor: string;
  result: Result;
  authentication: Authentication;
  card: Card;
  customer: Customer;
  customParameters: CustomParameters;
  risk: Risk;
  buildNumber: string;
  timestamp: string;
  ndc: string;
  channelName: string;
  source: string;
  paymentMethod: string;
  shortId: string;
}

export interface Risk {
  score: string;
}

export interface CustomParameters {
  SHOPPER_promoCode: string;
}

export interface Customer {
  givenName: string;
  surname: string;
  merchantCustomerId: string;
  sex: string;
  email: string;
}

export interface Card {
  bin: string;
  last4Digits: string;
  holder: string;
  expiryMonth: string;
  expiryYear: string;
}

export interface Authentication {
  entityId: string;
}

export interface Result {
  code: string;
  description: string;
}
