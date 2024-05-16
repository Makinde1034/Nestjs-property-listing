/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as FormData from 'form-data';
import Mailgun, { MailgunMessageData, MessagesSendResult } from 'mailgun.js';
import { IMailgunClient } from 'mailgun.js/Interfaces';
import {
  EMAIL_NOTIFICATION_TEMPLATE_NAME,
  FORGOT_PASSWORD_TEMPLATE_NAME,
  REGISTER_CONFIRMATION_TEMPLATE_NAME,
  STAFF_CONFIRMATION_TEMPLATE_NAME,
} from 'src/common/constants';
import { EmailNotificationPayload } from 'src/common/interface';
import { User } from 'src/entities';
import { MailSendService } from '../mail-service';
import { AppInfo } from 'src/common/utils/AppInfo';
import { loadUserName } from 'src/common/utils/class-loader';

@Injectable()
export class MailgunEmailService implements MailSendService {
  private readonly logger = new Logger(MailgunEmailService.name);
  private MAILGUN_KEY: string;
  private MAILGUN_DOMAIN: string;
  private MAIL_FROM: string;
  private client: IMailgunClient;
  private readonly mailgun = new Mailgun(FormData);
  constructor(private readonly configService: ConfigService) {
    this.MAILGUN_KEY = this.configService.get<string>('MAILGUN_KEY');
    this.MAILGUN_DOMAIN = this.configService.get<string>('MAILGUN_DOMAIN');
    this.MAIL_FROM = this.configService.get<string>('MAIL_FROM');
    this.client = this.mailgun.client({
      username: 'api',
      key: this.MAILGUN_KEY,
    });
  }

  /**
   * Send Email Using Mailgun
   * @async
   * @param {MailgunMessageData} data
   * @returns {Promise<MessagesSendResult>}
   */
  async sendMail(data: MailgunMessageData): Promise<MessagesSendResult> {
    try {
      return await this.client.messages.create(this.MAILGUN_DOMAIN, data);
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
      const mailgunData: MailgunMessageData = {
        from: this.MAIL_FROM,
        subject: 'Welcome to Waseet App! Confirm your Email',
        to: user.email,
        template: REGISTER_CONFIRMATION_TEMPLATE_NAME,
        'h:X-Mailgun-Variables': JSON.stringify({
          name: loadUserName(user),
          link,
        }),
      };
      await this.sendMail(mailgunData);

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
      const mailgunData: MailgunMessageData = {
        from: this.MAIL_FROM,
        subject: 'Reset Your Password',
        to: user.email,
        template: FORGOT_PASSWORD_TEMPLATE_NAME,
        'h:X-Mailgun-Variables': JSON.stringify({
          user_name: loadUserName(user),
          link,
          app_name: AppInfo.APP_NAME,
        }),
      };
      await this.sendMail(mailgunData);

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
      const mailgunData: MailgunMessageData = {
        from: this.MAIL_FROM,
        subject: 'Reset Your Password',
        to: user.email,
        template: EMAIL_NOTIFICATION_TEMPLATE_NAME,
        'h:X-Mailgun-Variables': JSON.stringify({
          user_name: loadUserName(user),
          title,
          app_name: AppInfo.APP_NAME,
          message,
        }),
      };
      await this.sendMail(mailgunData);
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
      const mailgunData: MailgunMessageData = {
        from: this.MAIL_FROM,
        subject: 'Welcome to Waseet App! Reset Your Password',
        to: user.email,
        template: STAFF_CONFIRMATION_TEMPLATE_NAME,
        'h:X-Mailgun-Variables': JSON.stringify({
          name: loadUserName(user),
          link,
          app_name: AppInfo.APP_NAME,
        }),
      };
      await this.sendMail(mailgunData);

      this.logger.log('E-Mail sent Successfully');
    } catch (error) {
      this.logger.debug(error);
    }
  }
}
