/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { WebHookPaymentResponse } from './dto/wehook.response';
import { ConfigService } from '@nestjs/config';
import {
  getWebhookConfigName,
  WebhookConfig,
} from '../../config/web-hook.config.ts/web-hook.config';

import { WebhookService } from './services/web-hook.services';
@Controller()
export class WebHookController {
  private webhookConfig: WebhookConfig;
  constructor(
    private configService: ConfigService,
    private webhookService: WebhookService,
  ) {
    this.webhookConfig = this.configService.get<WebhookConfig>(
      getWebhookConfigName(),
    );
  }
  logger = new Logger(WebHookController.name);
  @Post('webhook/payment')
  @HttpCode(200)
  Payment(
    @Body() hyperPayWebHookResponse: WebHookPaymentResponse,
    @Headers('x-signature') signature: string,
  ) {
    this.webhookService.handleWebHookForHyperpay(
      hyperPayWebHookResponse,
      signature,
    );
  }

  @Post('api/v1/user/iam')
  @HttpCode(200)
  User(@Body() natafh: any) {
    this.logger.log(natafh);
    return HttpStatus.OK;
  }
}
