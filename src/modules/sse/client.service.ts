import { Injectable, Logger } from '@nestjs/common';
import { Subject } from 'rxjs';
import { MessageEvent } from './request/app'; // Import your MessageEvent type
import { addClient, getClient, removeClient } from './services/global-clients';

@Injectable()
export class SseService {
  clients: Map<string, Subject<MessageEvent>> = new Map();
  private readonly logger = new Logger(SseService.name);

  addClient(
    userId: string,
    client: Subject<MessageEvent>,
    participantId?: string,
  ) {
    addClient(userId, client, participantId);
    this.logger.log(`Client added for userId: ${userId} and ${participantId}`);
  }

  removeClient(userId: string, participantId?: string) {
    removeClient(userId, participantId);
    this.logger.log(
      `Client removed for userId: ${userId}. Total clients: ${this.clients.size}`,
    );
  }
  /**
   * Retrieves the client's Subject<MessageEvent>
   * @param userId string
   */
  getClient(
    userId: string,
    participantId?: string,
  ): Subject<MessageEvent> | undefined {
    return getClient(userId, participantId);
  }

  /**
   * Send event to a specific user
   * @param userId string
   * @param payload MessageEvent
   */
  sendEvent(userId: string, payload: MessageEvent, participantId?: string) {
    console.log(this.clients);

    const client = this.getClient(userId, participantId);
    if (client) {
      client.next(payload);
      this.logger.log(`Event sent to userId: ${userId}`);
    } else {
      this.logger.warn(`No client connected for userId: ${userId}`);
    }
  }
}
