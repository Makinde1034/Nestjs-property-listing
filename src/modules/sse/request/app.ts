/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

export interface EventPayload {
  userId: string;
  data: any;
}

export interface MessageEvent {
  data: any;
  id?: string;
  type?: string;
  retry?: number;
}
