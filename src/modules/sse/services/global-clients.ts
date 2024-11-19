import { Subject } from 'rxjs';
import { MessageEvent } from '../request/app';

// GlobalClients.ts
// export const clients = new Map<string, Subject<MessageEvent>>();

// export const auctionClients = new Map<string, Subject<MessageEvent>>();

// export const clients = new Map<
//   string,
//   Map<string | null, Subject<MessageEvent>>
// >();

// // Add or remove clients globally

// export function addClient(
//   userId: string,
//   client: Subject<MessageEvent>,
//   participantId?: string,
// ) {
//   let userClients = clients.get(userId);

//   if (!userClients) {
//     userClients = new Map<string | null, Subject<MessageEvent>>();
//     clients.set(userId, userClients);
//   }

//   const data = userClients.set(participantId || null, client);

//   console.log(data);
//   // clients.set(userId, client);

//   // auctionClients.set(participantId, client);
// }

// export function removeClient(userId: string, participantId?: string) {
//   const userClients = clients.get(userId);

//   if (!userClients) return;

//   userClients.delete(participantId || null);

//   if (userClients.size === 0) {
//     clients.delete(userId);
//   }
// }

// export function getClient(
//   userId: string,
//   participantId?: string,
// ): Subject<MessageEvent> | undefined {
//   const userClients = clients.get(userId);
//   if (!userClients) return undefined;

//   return userClients.get(participantId || null);
// }

// // export function getClient(userId: string): Subject<MessageEvent> | undefined {
// //   return clients.get(userId);
// // }

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
  console.log(
    'participantToUserMap:',
    Array.from(participantToUserMap.entries()),
  );

  const userClients = clients.get(userId);
  return userClients?.get(participantId || null);
}

export function getUserIdByParticipantId(participantId: string) {
  console.log('participantToUserMap:', participantToUserMap),
    console.log(`Looking up participantId: ${participantId}`);
  return participantToUserMap.get(participantId);
}
