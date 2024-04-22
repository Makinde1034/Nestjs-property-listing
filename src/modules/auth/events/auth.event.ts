import { Injectable, Logger } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { OnEvent } from '@nestjs/event-emitter';
import { RegisterEventAction } from 'src/common/enums';
import { RegisterEventDto } from '../dtos';

@Injectable()
export class KycEventHandler {
  private logger = new Logger(KycEventHandler.name);
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
}
