/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Controller, Get, Res } from '@nestjs/common';

import { Response } from 'express';

import { PaymentService } from '../services/payment.service';
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
}
