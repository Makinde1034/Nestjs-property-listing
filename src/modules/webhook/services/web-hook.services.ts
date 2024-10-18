/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { PaymentEnum } from '../../../common/enums/payment.enum';
import {
  WebhookConfig,
  getWebhookConfigName,
} from '../../../config/web-hook.config.ts/web-hook.config';
import { WebHookPaymentResponse } from '../dto/wehook.response';

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
  NafathAuthenticationResponse,
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
    hyperPayWebHookResponse: WebHookPaymentResponse,
    signature: string,
  ) {
    let isValid = false;
    const data: any = JSON.stringify(hyperPayWebHookResponse);
    const valueToHash = data + this.webhookConfig;
    const hash = crypto.createHash('sha512').update(valueToHash).digest('hex');
    const { ivfromHttpHeader, authTagFromHttpHeader, httpBody } = data;
    // Convert from hex to Buffer
    const key = Buffer.from(this.webhookConfig.hyperPayDecriptionToken, 'hex');
    const iv = Buffer.from(ivfromHttpHeader, 'hex');
    const authTag = Buffer.from(authTagFromHttpHeader, 'hex');
    const cipherText = Buffer.from(httpBody, 'hex');
    // Prepare decryption
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    try {
      // Decrypt
      const decrypted = Buffer.concat([
        decipher.update(cipherText),
        decipher.final(),
      ]);
      this.logger.log(decrypted.toString()); // Or decrypted.toString('utf8') if you expect UTF-8
    } catch (error) {
      this.logger.error('Decryption failed:', error.message);
    }
    this.logger.log(
      'webhook_value:**************************************************************************************',
      hyperPayWebHookResponse,
      '**********************************************************************',
      signature,
    );
    if (
      hash === signature &&
      hyperPayWebHookResponse.payload.result.description ==
        'Transaction succeeded'
    ) {
      isValid = true;
    }
    if (!isValid) {
      // TODO: mark transaction as needing admin action
    } else {
      switch (hyperPayWebHookResponse.type) {
        case PaymentEnum.SUCCESSFUL_PAYMENT: {
          //This.transaction.handleWebhook(hyperPayWebhookResponse.payload)
          break;
        }
        case PaymentEnum.REGISTRATION: {
          break;
        }
        default:
          break;
      }
    }
    return new SuccessResponse();
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
