/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import {
  HyperpayConfig,
  getHyperpayConfigName,
} from '../../../config/payment/hyper-payment.config';
import {
  CheckoutResponse,
  InitiatePaymentInput,
  PerformCopyAndPayInput,
} from '../dto/request/payment.input';
import { AxiosRequestConfig } from 'axios';
import { URLSearchParams } from 'url';

@Injectable()
export class HyperPayService {
  private readonly logger = new Logger(HyperPayService.name);
  private hyperPayConfig: HyperpayConfig;
  private readonly options: AxiosRequestConfig;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.hyperPayConfig = this.configService.get<HyperpayConfig>(
      getHyperpayConfigName(),
    );

    this.options = {
      headers: {
        Authorization: `Bearer ${this.hyperPayConfig.token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
  }

  async createCheckout(initiatePaymentInput: InitiatePaymentInput) {
    try {
      const payload: PerformCopyAndPayInput = {
        entityId: this.hyperPayConfig.entityId,
        amount: initiatePaymentInput.amount,
        currency: 'SAR',
        paymentType: 'DB',
      };

      const payloadEntries: [string, string][] = Object.entries(payload).map(
        ([key, value]) => [key, String(value)],
      );
      const requestPayload = new URLSearchParams(payloadEntries).toString();

      const response = this.httpService.post(
        this.hyperPayConfig.baseUrl + '/checkouts',
        requestPayload,
        this.options,
      );
      const data: CheckoutResponse = await (await lastValueFrom(response)).data;
      return data;
    } catch (error) {
      this.logger.error('Error creating checkout', error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }

  async checkPaymentStatus(checkoutId: string) {
    const requestPayload1 = new URLSearchParams(checkoutId).toString();

    const requestpayload2 = new URLSearchParams({
      entityId: this.hyperPayConfig.entityId,
    }).toString();

    const response = this.httpService.get(
      this.hyperPayConfig.baseUrl +
        `checkouts/${requestPayload1}/payment?${requestpayload2}`,
      this.options,
    );

    const data = await (await lastValueFrom(response)).data;

    return data;
  }
}
