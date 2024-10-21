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
import { Public } from '../auth/decorators/permision.decorator';
@Controller()
export class WebHookController {
  private webhookConfig: WebhookConfig;
  constructor(
    private readonly configService: ConfigService,
    private readonly webhookService: WebhookService,
  ) {
    this.webhookConfig = this.configService.get<WebhookConfig>(
      getWebhookConfigName(),
    );
  }
  logger = new Logger(WebHookController.name);
  @Post('webhook/payment')
  @Public()
  @HttpCode(200)
  Payment(
    @Body() hyperPayWebHookResponse: any,
    @Headers('x-signature') signature: string,
  ) {
    console.log('response', hyperPayWebHookResponse);
    this.webhookService.handleWebHookForHyperpay(
      hyperPayWebHookResponse,
      signature,
    );
    return HttpStatus.OK;
  }

  @Post('api/v1/user/iam')
  @Public()
  @HttpCode(200)
  User(@Body() data: any) {
    this.webhookService.handleWebhookForNafath(data);
    return HttpStatus.OK;
  }
}
