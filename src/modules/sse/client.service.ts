import { Injectable, Logger } from '@nestjs/common';
import { Subject } from 'rxjs';
import { MessageEvent } from './request/app'; // Import your MessageEvent type
import { addClient, getClient, removeClient } from './services/global-clients';

@Injectable()
export class SseService {
  clients: Map<string, Subject<MessageEvent>> = new Map();
  private readonly logger = new Logger(SseService.name);

  addClient(userId: string, client: Subject<MessageEvent>) {
    addClient(userId, client);
    this.logger.log(`Client added for userId: ${userId}`);
  }

  removeClient(userId: string) {
    removeClient(userId);
    this.logger.log(
      `Client removed for userId: ${userId}. Total clients: ${this.clients.size}`,
    );
  }
  /**
   * Retrieves the client's Subject<MessageEvent>
   * @param userId string
   */
  getClient(userId: string): Subject<MessageEvent> | undefined {
    return getClient(userId);
  }

  /**
   * Send event to a specific user
   * @param userId string
   * @param payload MessageEvent
   */
  sendEvent(userId: string, payload: MessageEvent) {
    console.log(this.clients);

    const client = this.getClient(userId);
    if (client) {
      client.next(payload);
      this.logger.log(`Event sent to userId: ${userId}`);
    } else {
      this.logger.warn(`No client connected for userId: ${userId}`);
    }
  }
}
