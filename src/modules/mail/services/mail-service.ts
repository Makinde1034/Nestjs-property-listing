/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { EmailNotificationPayload } from 'src/common/interface';
import { User } from 'src/entities';

export interface MailSendService {
  sendUserConfirmation(user: User, link: string): Promise<void>;
  sendPasswordResetEmail(user: User, link: string): Promise<void>;
  sendEmailNotification(
    user: User,
    data: EmailNotificationPayload,
  ): Promise<void>;
  sendStaffConfirmation(user: User, link: string): Promise<void>;
}
