/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

export enum OfferListEnum {
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  ACTIVE = 'active',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export enum AuctionEnum {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  ACCEPTED = 'completed',
  CANCELED = 'cancled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ServiceProviderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export enum WorkflowActionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export enum ProviderServiceStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
}
