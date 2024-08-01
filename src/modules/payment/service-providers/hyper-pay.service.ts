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
import { PreAuthorisedPaymentInput } from '../dto/request/payment.input';
import { AxiosRequestConfig } from 'axios';
import { PreAuthorisedPaymentResponse } from '../dto/response/payment.response';

@Injectable()
export class HyperPay {
  private readonly logger = new Logger(HyperPay.name);
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
        'Content-Type': 'application/json',
      },
    };
  }

  async preAuthorisedPayment(payload: PreAuthorisedPaymentInput) {
    try {
      const response = this.httpService.post(
        this.hyperPayConfig.baseUrl + '/payments',
        payload,
        this.options,
      );
      const data: PreAuthorisedPaymentResponse = await (
        await lastValueFrom(response)
      ).data;
      return data;
    } catch (error) {
      this.logger.error('Error in payment pre-authorization', error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }

  async capturePayment(payload) {
    try {
      const response = this.httpService.post(
        this.hyperPayConfig.baseUrl + '/payments',
        payload,
        this.options,
      );
      const data: PreAuthorisedPaymentResponse = await (
        await lastValueFrom(response)
      ).data;
      return data;
    } catch (error) {
      this.logger.error('Error in payment pre-authorization', error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }
}
//   Const random = crypto
//   .createHmac('sha512', r)
//   .update(JSON.stringify(input))
//   .digest('hex');
// Const rand = random.slice(15, 25);
// Return rand;
