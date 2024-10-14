/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { PaymentService } from '../services/payment.service';
import { User } from '../../../entities';
import { AccessTokenGuard } from '../../auth/guards';
import {
  InitiatePaymentInput,
  VerifyPaymentInput,
} from '../dto/request/payment.input';
import {
  InitiatePaymentResponse,
  verifyPaymentResponse,
} from '../dto/response/payment.response';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { InvoiceResponse } from '../dto/response/invoice.response';
import { InvoiceService } from '../services/invoice.service';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';

@Resolver('payment')
export class PaymentResolver {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly invoiceService: InvoiceService,
  ) {}

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
    @Args('verifyPaymentInput') verifyDto: VerifyPaymentInput,
  ) {
    return await this.paymentService.verifyPayment(verifyDto);
  }

  @Query(() => InvoiceResponse)
  @UseGuards(AccessTokenGuard)
  async fetchInvoice(@Args('findOption') findOption: PaginateAndSort) {
    return await this.invoiceService.fetchInvoice(findOption);
  }
}
