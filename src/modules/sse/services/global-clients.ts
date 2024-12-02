import { Subject } from 'rxjs';
import { MessageEvent } from '../request/app';

export const clients = new Map<
  string,
  Map<string | null, Subject<MessageEvent>>
>();

export const participantToUserMap = new Map<string, string>();

export function addClient(
  userId: string,
  client: Subject<MessageEvent>,
  participantId?: string,
) {
  let userClients = clients.get(userId);

  if (!userClients) {
    userClients = new Map<string | null, Subject<MessageEvent>>();
    clients.set(userId, userClients);
  }

  userClients.set(participantId || null, client);

  if (participantId) {
    participantToUserMap.set(participantId, userId);
  }
}

export function removeClient(userId: string, participantId?: string) {
  const userClients = clients.get(userId);

  if (userClients) {
    userClients.delete(participantId || null);

    if (participantId) {
      participantToUserMap.delete(participantId);
    }

    if (userClients.size === 0) {
      clients.delete(userId);
    }
  }
}

export function getClient(
  userId: string,
  participantId?: string,
): Subject<MessageEvent> | undefined {
  const userClients = clients.get(userId);
  return userClients?.get(participantId || null);
}

export function getUserIdByParticipantId(participantId: string) {
  return participantToUserMap.get(participantId);
}
