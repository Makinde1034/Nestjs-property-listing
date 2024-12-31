/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { User } from '../../../../entities';

export class CreateActionInput {
  actionType: string; // "create" or "update"

  document: string; // E.g., "User", "Listing", "Auction"

  targetEntityId?: string; // E.g., User ID, Auction Id ID (null for "create" actions)
  payload: string;

  status?: string;

  user: User;

  admin?: User;

  event?: string;
}
