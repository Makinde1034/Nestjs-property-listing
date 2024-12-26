/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Module } from '@nestjs/common';
// Import { WebHookController } from './web-hook.controller';
import { WebhookService } from './services/web-hook.services';
import { WebHookController } from './web-hook.controller';
import { JwtService } from '@nestjs/jwt';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [PaymentModule],
  providers: [WebhookService, JwtService],
  controllers: [WebHookController],
})
export class WebHookModule {}
