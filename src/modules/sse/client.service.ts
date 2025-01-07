/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable, Logger } from '@nestjs/common';
import { Subject } from 'rxjs';
import { MessageEvent } from './request/app'; // Import your MessageEvent type
import {
  addClient,
  getClient,
  removeClient,
  getUserIdByParticipantId,
} from './services/global-clients';

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

  getUserIdByParticipantId(participantId: string) {
    return getUserIdByParticipantId(participantId);
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
    let client: Subject<MessageEvent> | undefined;

    if (participantId) {
      const resolvedUserId = this.getUserIdByParticipantId(participantId);
      if (resolvedUserId) {
        client = this.getClient(resolvedUserId, participantId);
      }
    } else {
      client = this.getClient(userId);
    }

    if (client) {
      client.next(payload); // Send the event to the connected client
      this.logger.log(
        `Event sent to userId: ${participantId ? userId + ' (participant)' : userId}`,
      );
    } else {
      this.logger.warn(`No client connected for userId: ${userId}`);
    }
  }
}
