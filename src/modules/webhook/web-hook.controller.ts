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
import { ConfigService } from '@nestjs/config';
import {
  getWebhookConfigName,
  WebhookConfig,
} from '../../config/payment/web-hook.config';

import { WebhookService } from './services/web-hook.services';
import { Public } from '../auth/decorators/permision.decorator';
import { SseService } from '../sse/client.service';
import { WebHookResponse } from './dto/wehook.response';
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
  payment(
    @Headers('x-initialization-vector') initializationVector: string, // Extract the IV from the headers
    @Headers('x-authentication-tag') authenticationTag: string,
    @Body() hyperPayWebHookResponse: any,
  ) {
    console.log(
      hyperPayWebHookResponse,
      initializationVector,
      authenticationTag,
    );
    const data = JSON.stringify(hyperPayWebHookResponse);
    this.webhookService.handleWebHookForHyperpay(
      data,
      initializationVector,
      authenticationTag,
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
