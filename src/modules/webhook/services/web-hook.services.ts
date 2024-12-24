/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { PaymentEnum } from '../../../common/enums/payment.enum';
import {
  WebhookConfig,
  getWebhookConfigName,
} from '../../../config/web-hook.config.ts/web-hook.config';
import {
  WebHookPaymentResponse,
  WebHookResponse,
} from '../dto/wehook.response';

import { ConfigService } from '@nestjs/config';
import { SuccessResponse } from '../../../common/utils/success.response';
import * as crypto from 'crypto';

import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  NafathUserResponse,
  NafathWebHookResponse,
} from '../../user/dtos/response/nafath';
import { UserService } from '../../user/services';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class WebhookService {
  private webhookConfig: WebhookConfig;
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {
    this.webhookConfig = this.configService.get<WebhookConfig>(
      getWebhookConfigName(),
    );
  }
  logger = new Logger(WebhookService.name);

  handleWebHookForHyperpay(
    payload: WebHookResponse,
    ivfromHttpHeader: string,
    authTagFromHttpHeader: string,
  ) {
    try {
      // const algorithm = 'aes-256-gcm';
      // // Shared secret key (from configuration)
      // const secretFromConfiguration =
      //   this.webhookConfig.hyperPayDecriptionToken;

      // const httpBody = payload.encryptedBody; // Should be a hex string

      // // Convert hex strings to binary buffers
      // const key = Buffer.from(secretFromConfiguration, 'hex'); // 256-bit key
      // const iv = Buffer.from(ivfromHttpHeader, 'hex'); // Initialization vector
      // const authTag = Buffer.from(authTagFromHttpHeader, 'hex'); // Authentication tag
      // const cipherText = Buffer.from(httpBody, 'hex'); // Ciphertext

      // // Prepare the decipher
      // const decipher = crypto.createDecipheriv(algorithm, key, iv);

      // // Set the authentication tag
      // decipher.setAuthTag(authTag);

      // // Decrypt the data
      // const decrypted = Buffer.concat([
      //   decipher.update(cipherText),
      //   decipher.final(),
      // ]).toString('utf8'); // Combine and convert to UTF-8 string

      // // Log or process the decrypted data
      // console.log('Decrypted Payload:', decrypted);

      return new SuccessResponse();
    } catch (error) {
      this.logger.error('Decryption failed:', error.message);
      throw new Error('DecryptionFailed');
    }
  }

  // handleWebHookForHyperpay(payload: WebHookResponse) {
  //   try {
  //     let isValid = false;

  //     const algorithm = 'aes-256-cbc';
  //     const key = crypto.randomBytes(32); // 256-bit key
  //     const iv = crypto.randomBytes(16);

  //     const decipher = crypto.createDecipheriv(algorithm, key, iv);
  //     let decrypted = decipher.update(payload.encryptedBody, 'base64', 'utf8'); // Assuming input is Base64
  //     decrypted += decipher.final('utf8'); // Add any remaining decrypted content

  //     return new SuccessResponse();
  //   } catch (error) {
  //     this.logger.error('Decryption failed:', error.message);
  //   }
  // }

  async handleWebhookForNafath(data: NafathWebHookResponse) {
    try {
      const userData: NafathUserResponse = this.jwtService.decode(
        data.response,
      );
      await this.userService.finalizeUpgradeUser(data, userData);
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }
}
