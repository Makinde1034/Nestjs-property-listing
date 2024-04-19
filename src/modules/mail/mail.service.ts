import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  constructor(private readonly configService: ConfigService) {
    SendGrid.setApiKey(configService.get('SENDGRID_API_KEY'));
  }

  /**
   * Send Email
   * @async
   * @param {SendGrid.MailDataRequired} data
   * @returns {Promise<void>}
   */
  async sendEmail(data: SendGrid.MailDataRequired): Promise<void> {
    try {
      await SendGrid.send(data);
      this.logger.log(`E-Mail sent to ${data.to}`);
    } catch (error) {
      this.logger.debug(error);
    }
  }
}
