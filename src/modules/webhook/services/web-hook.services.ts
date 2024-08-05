/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

// Import { ConfigService } from '@nestjs/config';
// // import { SuccessResponse } from '../../../common/utils/success.response';
// Import { WebHookPaymentResponse } from '../dto/wehook.response';
// // import * as crypto from 'crypto';

// Import {
//   WebhookConfig,
//   GetWebhookConfigName,
// } from '../../../config/web-hook.config.ts/web-hook.config';
// Import { Injectable } from '@nestjs/common';
// @Injectable()
export class WebhookService {
  //   // private webhookConfig: WebhookConfig;
  //   Constructor(private configService: ConfigService) {
  //     This.webhookConfig = this.configService.get<WebhookConfig>(
  //       GetWebhookConfigName(),
  //     );
  //   }
  //   HandleWebHookForHyperpay(
  //     HyperPayWebHookResponse: WebHookPaymentResponse,
  //     Signature: string,
  //   ) {
  //     // Let isValid = false;
  //     // Const data: any = JSON.stringify(hyperPayWebHookResponse);
  //     // Const valueToHash = data + this.webhookConfig;
  //     // Const hash = crypto.createHash('sha512').update(valueToHash).digest('hex');
  //     // Const { ivfromHttpHeader, authTagFromHttpHeader, httpBody } = data;
  //     // // Convert from hex to Buffer
  //     // Const key = Buffer.from(this.webhookConfig.hyperPayDecriptionToken, 'hex');
  //     // Const iv = Buffer.from(ivfromHttpHeader, 'hex');
  //     // Const authTag = Buffer.from(authTagFromHttpHeader, 'hex');
  //     // Const cipherText = Buffer.from(httpBody, 'hex');
  //     // // Prepare decryption
  //     // Const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  //     // Decipher.setAuthTag(authTag);
  //     // Try {
  //     //   // Decrypt
  //     //   Const decrypted = Buffer.concat([
  //     //     Decipher.update(cipherText),
  //     //     Decipher.final(),
  //     //   ]);
  //     //   Console.log(decrypted.toString()); // Or decrypted.toString('utf8') if you expect UTF-8
  //     // } catch (error) {
  //     //   Console.error('Decryption failed:', error.message);
  //     // }
  //     // Console.log(
  //     //   'webhook_value:**************************************************************************************',
  //     //   HyperPayWebHookResponse,
  //     //   '      ***************************************',
  //     //   Signature,
  //     // );
  //     // If (
  //     //   Hash === signature &&
  //     //   HyperPayWebHookResponse.payload.result.description ==
  //     //     'Transaction succeeded'
  //     // ) {
  //     //   IsValid = true;
  //     // }
  //     // If (!isValid) {
  //     //TODO: mark transaction as needing admin action
  //     // } else {
  //     // Switch (hyperPayWebHookResponse.type) {
  //     //   Case PaymentEnum.SUCCESSFUL_PAYMENT: {
  //     //     This.webhookService.handleWebHookForHyperpay(hyperPayWebHookResponse);
  //     //     Break;
  //     //   }
  //     //   Case PaymentEnum.REGISTRATION: {
  //     //     Break;
  //     //   }
  //     //   Default:
  //     //     Break;
  //     // }
  //   }
  //   // Return new SuccessResponse();
  //   // }
}
