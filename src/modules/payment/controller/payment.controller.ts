/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from '../services/payment.service';

import { InitiatePaymentInput } from '../dto/request/payment.input';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  // @UseGuards(RestAccessTokenGuard)
  @Post('initialize')
  async initiatePayment(@Body() createPaymentInput: InitiatePaymentInput) {
    return await this.paymentService.initializePayment(createPaymentInput);
  }
}
