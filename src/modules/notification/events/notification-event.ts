/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from '../services';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationEvent } from 'src/common/enums';
import { NotificationEventDto } from '../dtos';
import { SendNotificationInput } from '../../../common/interface';

@Injectable()
export class NotificationEventListener {
  private logger = new Logger(NotificationEventListener.name);
  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent(NotificationEvent.SEND_NOTIFICATION, { async: true })
  async handleSendUserNotificationEvent(payload: SendNotificationInput) {
    this.logger.debug(
      `Started Handling ${NotificationEvent.SEND_NOTIFICATION} event.`,
      new Date(),
    );
    await this.notificationService.sendNotification(payload);
    this.logger.debug(
      `Finished Handling ${NotificationEvent.SEND_NOTIFICATION}`,
      new Date(),
    );
  }
}
