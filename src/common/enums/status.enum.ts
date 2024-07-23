/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

export enum StatusEnum {
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  VERIFIED = 'VERIFIED',
}
export enum StatusListEnum {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCLED = 'cancled',
  CLOSED = 'closed',
  REJECTED = 'rejected',
}

export enum OfferListEnum {
  // CANCLED = 'cancled',
  EXPIRED = 'expired',
  ACTIVE = 'active',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export enum ListingStatus {
  ACTIVE = 'active',

  REMOVED = 'removed',
}
export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}
