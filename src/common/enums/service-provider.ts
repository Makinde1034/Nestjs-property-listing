/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

export enum ServiceProvidedStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  DONE = 'done',
  APPEALED = 'appealed',
  CANCELED = 'canceled',
  COMPLETED = 'confirmed',
}

export enum ServiceProviderLicense {
  IBAN = 'ibanCertificate',

  WORK_LICENSE = 'workLicense',

  ID_OR_CR = 'idOrCr',
}
