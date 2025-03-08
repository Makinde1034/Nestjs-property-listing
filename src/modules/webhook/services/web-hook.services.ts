/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { PaymentEnum } from '../../../common/enums/payment.enum';
import {
  WebhookConfig,
  getWebhookConfigName,
} from '../../../config/payment/web-hook.config';
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
import {
  getHyperpayConfigName,
  HyperpayConfig,
} from '../../../config/payment/hyper-payment.config';
import { PaymentService } from '../../payment/services/payment.service';
@Injectable()
export class WebhookService {
  private readonly hyperPayConfig: HyperpayConfig;
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly paymentService: PaymentService,
  ) {
    this.hyperPayConfig = this.configService.get<HyperpayConfig>(
      getHyperpayConfigName(),
    );
  }
  logger = new Logger(WebhookService.name);

  async handleWebHookForHyperpay(
    payload: any,
    ivfromHttpHeader: string,
    authTagFromHttpHeader: string,
  ) {
    try {
      const algorithm = 'aes-256-gcm';
      const secretFromConfiguration =
        this.hyperPayConfig.hyperPayDecriptionToken;

      // Validate inputs

      // // Convert hex strings to binary buffers
      const key = Buffer.from(secretFromConfiguration, 'hex');
      const iv = Buffer.from(ivfromHttpHeader, 'hex');
      const authTag = Buffer.from(authTagFromHttpHeader, 'hex');
      const cipherText = Buffer.from(payload?.encryptedBody, 'hex');

      // // Decrypt the data
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(cipherText),
        decipher.final(),
      ]).toString('utf8');
      console.log(payload);

      const data: WebHookPaymentResponse = JSON.parse(decrypted);

      await this.paymentService.finalizeTransaction(data);

      return new SuccessResponse();
    } catch (error) {
      console.error('Decryption failed:', error.message);
    }
  }

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
