/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Controller } from '@nestjs/common';

import { PaymentService } from '../services/payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  // @UseGuards(RestAccessTokenGuard)
}
