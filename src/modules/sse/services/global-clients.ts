import { Subject } from 'rxjs';
import { MessageEvent } from '../request/app';

// GlobalClients.ts
export const clients = new Map<string, Subject<MessageEvent>>();

// Add or remove clients globally
export function addClient(userId: string, client: Subject<MessageEvent>) {
  clients.set(userId, client);
}

export function removeClient(userId: string) {
  clients.delete(userId);
}

export function getClient(userId: string): Subject<MessageEvent> | undefined {
  return clients.get(userId);
}
