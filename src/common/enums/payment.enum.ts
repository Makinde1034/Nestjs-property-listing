/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

export enum PaymentEnum {
  SUCCESSFUL_PAYMENT = 'PAYMENT',
  REGISTRATION = 'REGISTRATION',
}

export enum TransactionType {
  DEBIT = 'debit',
  CREDIT = 'credit',
}

export enum PaymentTypeEnum {
  AUCTION_ENTRY = 'Auction Entry Fee',
  PROMOTION_FEE = 'Promotion Fee' ,
  AUTO_BIDDING = 'Auto Bidding Fee',
  SAII_FEE = 'Saii Fee'
}