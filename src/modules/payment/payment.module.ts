/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Module } from '@nestjs/common';
import { PaymentService } from './services/payment.service';
import { PaymentResolver } from './resolver/payment.resolver';

@Module({
  providers: [PaymentResolver, PaymentService],
})
export class PaymentModule {}
