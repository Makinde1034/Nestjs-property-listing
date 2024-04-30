/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

export enum UserStatus {
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  VERIFIED = 'VERIFIED',
  COMPLETED = 'COMPLETED',
  DISABLED = 'DISABLED',
  DELETED = 'DELETED',
}

export enum UserActionEnum {
  DISABLE = 'disable',
  ENABLE = 'enable',
}
