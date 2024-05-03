/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable, Logger } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { OnEvent } from '@nestjs/event-emitter';
import { RegisterEventAction } from 'src/common/enums';
import { RegisterEventDto } from '../dtos';

@Injectable()
export class AuthEventHandler {
  private logger = new Logger(AuthEventHandler.name);
  constructor(private readonly authService: AuthService) {}

  @OnEvent(RegisterEventAction.USER_CREATED, { async: true })
  async handleUserCreatedEvent(payload: RegisterEventDto) {
    this.logger.debug(
      `Started Handling ${RegisterEventAction.USER_CREATED} event.`,
      new Date(),
    );
    const { user } = payload;
    await this.authService.sendEmailConfirmation(user);

    this.logger.debug(
      `Finished Handling ${RegisterEventAction.USER_CREATED}`,
      new Date(),
    );
  }

  @OnEvent(RegisterEventAction.SEND_PASSWORD_RESET, { async: true })
  async handleResetPasswordEvent(payload: RegisterEventDto) {
    this.logger.debug(
      `Started Handling ${RegisterEventAction.SEND_PASSWORD_RESET} event.`,
      new Date(),
    );
    const { user } = payload;
    await this.authService.generateAndSendPasswordResetToken(user);

    this.logger.debug(
      `Finished Handling ${RegisterEventAction.SEND_PASSWORD_RESET}`,
      new Date(),
    );
  }
}
