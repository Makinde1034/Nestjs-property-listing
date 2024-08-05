/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

// Import {
//   Body,
//   Controller,
//   Header,
//   Headers,
//   HttpCode,
//   HttpStatus,
//   Post,
// } from '@nestjs/common';
// Import { WebHookPaymentResponse } from './dto/wehook.response';
// Import { ConfigService } from '@nestjs/config';
// Import {
//   GetWebhookConfigName,
//   WebhookConfig,
// } from '../../config/web-hook.config.ts/web-hook.config';

// Import { WebhookService } from './services/web-hook.services';
// @Controller()
// Export class WebHookController {
//   Private webhookConfig: WebhookConfig;
//   Constructor(
//     Private configService: ConfigService,
//     Private webhookService: WebhookService,
//   ) {
//     This.webhookConfig = this.configService.get<WebhookConfig>(
//       GetWebhookConfigName(),
//     );
//   }
//   @Post('webhook/payment')
//   @HttpCode(200)
//   Payment(
//     @Body() hyperPayWebHookResponse: WebHookPaymentResponse,
//     @Headers('x-signature') signature: string,
//   ) {
//     // this.webhookService.handleWebHookForHyperpay(
//     //   hyperPayWebHookResponse,
//     //   signature,
//     // );
//   }

//   @Post('api/v1/user/iam')
//   @HttpCode(200)
//   User() {
//     Return HttpStatus.OK;
//   }
// }
