/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from 'src/entities';
import { AppInfo } from 'src/common/utils/AppInfo';
import { EmailNotificationPayload } from 'src/common/interface';
import { MailSendService } from '../mail-service';
import { loadUserName } from 'src/common/utils/class-loader';

@Injectable()
export class NodeMailerEmailService implements MailSendService {
  private readonly logger = new Logger(NodeMailerEmailService.name);
  constructor(private readonly mailerService: MailerService) {}

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
          name: loadUserName(user),
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
          name: loadUserName(user),
          url: link,
          app: AppInfo.APP_NAME,
        },
      });
      this.logger.debug('Email Sent');
    } catch (error) {
      this.logger.debug(error);
    }
  }

  /**
   * Send Email Notification
   * @async
   * @param {User} user
   * @param {EmailNotificationPayload} data
   * @returns {Promise<void>}
   */
  async sendEmailNotification(
    user: User,
    data: EmailNotificationPayload,
  ): Promise<void> {
    const { message, title } = data;
    try {
      await this.mailerService.sendMail({
        to: user.email,
        // From: '"Support Team" <support@example.com>', // override default from
        subject: title,
        template: './notification', // `.hbs` extension is appended automatically
        context: {
          // ✏️ filling curly brackets with content
          name: loadUserName(user),
          message,
          app: AppInfo.APP_NAME,
          title,
        },
      });
      this.logger.debug('Email Sent');
    } catch (error) {
      this.logger.debug(error);
    }
  }

  /**
   * Send Staff Email Confirmation/Password reset
   * @async
   * @param {User} user
   * @param {string} link
   * @returns {Promise<void>}
   */
  async sendStaffConfirmation(user: User, link: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        // From: '"Support Team" <support@example.com>', // override default from
        subject: 'Welcome to Waseet App! Reset Your Password',
        template: './staff-confirmation', // `.hbs` extension is appended automatically
        context: {
          name: loadUserName(user),
          link,
        },
      });
      this.logger.log('E-Mail sent Successfully');
    } catch (error) {
      this.logger.debug(error);
    }
  }
}
