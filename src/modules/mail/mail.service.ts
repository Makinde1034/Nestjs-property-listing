/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import * as SendGrid from '@sendgrid/mail';
import { User } from 'src/entities';
import { AppInfo } from 'src/common/utils/AppInfo';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {
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
      this.logger.log('E-Mail sent Successfully');
    } catch (error) {
      this.logger.debug(error);
    }
  }

  /**
   * Send Email Confirmation
   * @async
   * @param {User} user
   * @param {string} link
   * @returns {Promise<void>}
   */
  async sendUserConfirmation(user: User, link: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        // From: '"Support Team" <support@example.com>', // override default from
        subject: 'Welcome to Waseet App! Confirm your Email',
        template: './confirmation', // `.hbs` extension is appended automatically
        context: {
          // ✏️ filling curly brackets with content
          name: `${user.firstName} ${user.lastName}`,
          url: link,
        },
      });
      this.logger.log('E-Mail sent Successfully');
    } catch (error) {
      this.logger.debug(error);
    }
  }

  /**
   * Send Email Confirmation
   * @async
   * @param {User} user
   * @param {string} link
   * @returns {Promise<void>}
   */
  async sendPasswordResetEmail(user: User, link: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        // From: '"Support Team" <support@example.com>', // override default from
        subject: 'Reset Your Password',
        template: './password-reset', // `.hbs` extension is appended automatically
        context: {
          // ✏️ filling curly brackets with content
          name: `${user.firstName} ${user.lastName}`,
          url: link,
          app: AppInfo.APP_NAME,
        },
      });
      this.logger.debug('Email Sent');
    } catch (error) {
      this.logger.debug(error);
    }
  }
}
