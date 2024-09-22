/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { PaymentService } from '../services/payment.service';
import { User } from '../../../entities';
import { AccessTokenGuard } from '../../auth/guards';
import {
  InitiatePaymentInput,
  verifyPaymentInput,
} from '../dto/request/payment.input';
import {
  InitiatePaymentResponse,
  verifyPaymentResponse,
} from '../dto/response/payment.response';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Resolver('payment')
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @Mutation(() => InitiatePaymentResponse)
  @UseGuards(AccessTokenGuard)
  async initializePayment(
    @Args('paymentInput') paymentDto: InitiatePaymentInput,
    @CurrentUser() user: User,
  ) {
    return await this.paymentService.initializePayment(paymentDto, user);
  }

  @Mutation(() => verifyPaymentResponse)
  @UseGuards(AccessTokenGuard)
  async verifyPayment(
    @Args('verifyPaymentInput') verifyDto: verifyPaymentInput,
  ) {
    return await this.paymentService.verifyPayment(verifyDto);
  }
}
