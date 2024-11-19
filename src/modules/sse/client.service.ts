import { Injectable, Logger } from '@nestjs/common';
import { Subject } from 'rxjs';
import { MessageEvent } from './request/app'; // Import your MessageEvent type

@Injectable()
export class SseService {
  /**
   * Clients map: userId -> (optional participantId -> Subject)
   */
  private clients: Map<
    string,
    Map<string, Subject<MessageEvent>> | Subject<MessageEvent>
  > = new Map();

  private readonly logger = new Logger(SseService.name);

  /**
   * Adds a client for a specific user and optionally a participant.
   * @param userId string
   * @param client Subject<MessageEvent>
   * @param participantId string (optional)
   */
  addClient(
    userId: string,
    client: Subject<MessageEvent>,
    participantId?: string,
  ) {
    if (participantId) {
      // Handle participant-specific clients
      let userClients = this.clients.get(userId) as
        | Map<string, Subject<MessageEvent>>
        | undefined;

      if (!userClients || !(userClients instanceof Map)) {
        userClients = new Map<string, Subject<MessageEvent>>();
        this.clients.set(userId, userClients);
      }

      userClients.set(participantId, client);
      this.logger.log(
        `Client added for userId: ${userId}, participantId: ${participantId}`,
      );
    } else {
      // Handle user-level clients
      this.clients.set(userId, client);
      this.logger.log(`Client added for userId: ${userId}`);
    }
  }

  /**
   * Removes a client for a specific user and optionally a participant.
   * @param userId string
   * @param participantId string (optional)
   */
  removeClient(userId: string, participantId?: string) {
    const userClients = this.clients.get(userId);

    if (participantId && userClients instanceof Map) {
      // Remove participant-specific client
      userClients.delete(participantId);
      if (userClients.size === 0) {
        this.clients.delete(userId);
      }
      this.logger.log(
        `Client removed for userId: ${userId}, participantId: ${participantId}.`,
      );
    } else if (!participantId) {
      // Remove user-level client
      this.clients.delete(userId);
      this.logger.log(`Client removed for userId: ${userId}`);
    } else {
      this.logger.warn(`No client found for userId: ${userId}`);
    }
  }

  /**
   * Retrieves the client's Subject<MessageEvent> for a specific user and optionally a participant.
   * @param userId string
   * @param participantId string (optional)
   */
  getClient(
    userId: string,
    participantId?: string,
  ): Subject<MessageEvent> | undefined {
    const userClients = this.clients.get(userId);

    if (participantId && userClients instanceof Map) {
      return userClients.get(participantId);
    } else if (!participantId && !(userClients instanceof Map)) {
      return userClients as Subject<MessageEvent>;
    }
    return undefined;
  }

  /**
   * Send an event to a specific user and optionally a participant.
   * @param userId string
   * @param payload MessageEvent
   * @param participantId string (optional)
   */
  sendEvent(userId: string, payload: MessageEvent, participantId?: string) {
    const client = this.getClient(userId, participantId);

    if (client) {
      client.next(payload);
      this.logger.log(
        `Event sent to userId: ${userId}${participantId ? `, participantId: ${participantId}` : ''}`,
      );
    } else {
      this.logger.warn(
        `No client connected for userId: ${userId}${participantId ? `, participantId: ${participantId}` : ''}`,
      );
    }
  }
}
