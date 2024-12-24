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
} from '../../config/web-hook.config.ts/web-hook.config';

import { WebhookService } from './services/web-hook.services';
import { Public } from '../auth/decorators/permision.decorator';
import { SseService } from '../sse/client.service';
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
    @Headers() headers: Record<string, string | string[]>, // Capture all headers
    @Headers('x-iv') iv: string, // Extract the IV from the headers
    @Headers('x-auth-tag') authTag: string, // Extract the Auth Tag from the headers
    @Body() hyperPayWebHookResponse: any,
  ) {
    console.log('Headers:', headers);
    console.log(hyperPayWebHookResponse, authTag, iv);
    this.webhookService.handleWebHookForHyperpay(
      hyperPayWebHookResponse,
      iv,
      authTag,
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
