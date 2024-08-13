/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { Response } from 'express';
import { InitiatePaymentInput } from '../dto/request/payment.input';
@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}
  @Get('invoice')
  generateInvoice(@Res() res: Response) {
    const screenshot = this.paymentService.invoice();

    res.set({
      'Content-Type': 'application/pdf',
    });
    res.end(screenshot);
  }
  // @UseGuards(RestAccessTokenGuard)
  @Post('initialize')
  async initiatePayment(@Body() createPaymentInput: InitiatePaymentInput) {
    return await this.paymentService.initializePayment(createPaymentInput);
  }
}
