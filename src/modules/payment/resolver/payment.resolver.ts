/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Resolver, Mutation } from '@nestjs/graphql';

import { Payment } from '../entities/payment.entity';
import { PaymentService } from '../services/payment.service';

@Resolver('payment')
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @Mutation(() => Payment)
  initializePayment() {
    return this.paymentService.initializePayment();
  }

  @Mutation(() => Payment)
  verify() {
    return this.paymentService.verifyPayment();
  }
}
