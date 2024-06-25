/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Controller, Get, Query, Res } from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { Response } from 'express';
@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}
  @Get('invoice')
  async generateInvoice(@Res() res: Response, @Query() invoice) {
    const screenshot = await this.paymentService.invoice(invoice);

    res.set({
      'Content-Type': 'image/png',
      'Content-Length': screenshot,
    });
    res.end(screenshot);
  }
}
