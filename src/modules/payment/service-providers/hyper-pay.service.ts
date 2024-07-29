/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import {
  HyperpayConfig,
  getHyperpayConfigName,
} from '../../../config/payment/hyper-payment.config';

@Injectable()
export class HyperPay {
  private readonly logger = new Logger(HyperPay.name);
  private hyperPayConfig: HyperpayConfig;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.hyperPayConfig = this.configService.get<HyperpayConfig>(
      getHyperpayConfigName(),
    );
  }

  async preAuthorisedPayment(params: any, options: any): Promise<any> {
    try {
      const response = this.httpService.post(
        this.hyperPayConfig.baseUrl + '/payments',
        params,
        options,
      );

      const data = await lastValueFrom(response);

      this.logger.log('Payment pre-authorization successful', data);
      return data;
    } catch (error) {
      this.logger.error('Error in payment pre-authorization', error);
      throw error;
    }
  }
}
//   Const random = crypto
//   .createHmac('sha512', r)
//   .update(JSON.stringify(input))
//   .digest('hex');
// Const rand = random.slice(15, 25);
// Return rand;
