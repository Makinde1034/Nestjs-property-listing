import { User } from '../../../../entities';

export class CreateActionInput {
  actionType: string; // "create" or "update"

  document: string; // e.g., "User", "Listing", "Auction"

  targetEntityId?: string; // e.g., User ID, Auction Id ID (null for "create" actions)
  payload: string;

  status?: string;

  user: User;

  admin?: User;

  event?: string;
}
