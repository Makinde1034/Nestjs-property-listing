/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RegisterEventAction } from 'src/common/enums';
import { UserService } from '../services';
import { StaffCreatedEventDto } from '../dtos';

@Injectable()
export class UserEventHandler {
  private logger = new Logger(UserEventHandler.name);
  constructor(private readonly userService: UserService) {}

  @OnEvent(RegisterEventAction.STAFF_CREATED, { async: true })
  async handleUserCreatedEvent(payload: StaffCreatedEventDto) {
    this.logger.debug(
      `Started Handling ${RegisterEventAction.STAFF_CREATED} event.`,
      new Date(),
    );
    const { data } = payload;
    await this.userService.sendPasswordEmailToStaff(data);

    this.logger.debug(
      `Finished Handling ${RegisterEventAction.STAFF_CREATED}`,
      new Date(),
    );
  }
}
