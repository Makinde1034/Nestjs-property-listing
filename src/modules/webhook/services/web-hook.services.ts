/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { ConfigService } from '@nestjs/config';
import { SuccessResponse } from '../../../common/utils/success.response';
import { WebHookPaymentResponse } from '../dto/wehook.response';
import * as crypto from 'crypto';

import {
  WebhookConfig,
  getWebhookConfigName,
} from '../../../config/web-hook.config.ts/web-hook.config';
import { Injectable } from '@nestjs/common';
@Injectable()
export class WebhookService {
  private webhookConfig: WebhookConfig;

  constructor(private configService: ConfigService) {
    this.webhookConfig = this.configService.get<WebhookConfig>(
      getWebhookConfigName(),
    );
  }

  async handleWebHookForHyperpay(
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
      console.log(decrypted.toString()); // Or decrypted.toString('utf8') if you expect UTF-8
    } catch (error) {
      console.error('Decryption failed:', error.message);
    }

    console.log(
      'webhook_value:**************************************************************************************',
      hyperPayWebHookResponse,
      '      ***************************************',

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
      //TODO: mark transaction as needing admin action
    } else {
      // Switch (hyperPayWebHookResponse.type) {
      //   Case PaymentEnum.SUCCESSFUL_PAYMENT: {
      //     This.webhookService.handleWebHookForHyperpay(hyperPayWebHookResponse);
      //     Break;
      //   }
      //   Case PaymentEnum.REGISTRATION: {
      //     Break;
      //   }
      //   Default:
      //     Break;
      // }
    }
    return new SuccessResponse();
  }
}
