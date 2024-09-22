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

import { AxiosRequestConfig } from 'axios';

import { URLSearchParams } from 'url';

import * as querystring from 'querystring';

import * as https from 'https';

import { User } from '../../../entities';
import {
  CheckoutResponse,
  InitiatePaymentInput,
} from '../dto/request/payment.input';
import {
  HyperpayConfig,
  getHyperpayConfigName,
} from '../../../config/payment/hyper-payment.config';

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

  async createCheckout(
    initiatePaymentInput: InitiatePaymentInput,
    user: User,
  ): Promise<CheckoutResponse> {
    try {
      this.logger.log('createCheckout', initiatePaymentInput, user);
      const payload = {
        entityId: process.env.HYPERPAY_ENTITY_ID,
        amount: initiatePaymentInput.amount,
        currency: 'SAR', // Changed to SAR as per the documentation
        paymentType: 'DB',
        'customer.email': user.email,
        'customer.givenName': user.firstName,
        'customer.surname': user.lastName,
        'billing.city': user.city,
        'billing.country': user.nationality,

        merchantTransactionId: '12345',
      };

      const data = querystring.stringify(payload as any);

      const options = {
        port: 443,
        host: 'eu-test.oppwa.com', // Updated host
        path: '/v1/checkouts',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': data.length,
          Authorization: `Bearer ${process.env.HYPERPAY_TOKEN}`,
        },
      };

      const checkoutResponse: CheckoutResponse = await this.makeHttpsRequest(
        options,
        data,
      );
      return checkoutResponse;
    } catch (error) {
      this.logger.error('Error creating checkout', error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }

  async verifyPayment(checkoutId: string): Promise<any> {
    try {
      const path = `/v1/checkouts/${checkoutId}/payment?entityId=${process.env.HYPERPAY_ENTITY_ID}`;

      const options = {
        port: 443,
        host: 'eu-test.oppwa.com',
        path: path,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.HYPERPAY_TOKEN}`,
        },
      };

      const payload = {
        entityId: process.env.HYPERPAY_ENTITY_ID, // Updated entityId
      };

      const data = querystring.stringify(payload);

      const response = await this.makeHttpsRequest(options, data);

      return response;
    } catch (error) {
      this.logger.error('Error verifying payment', error);
      throw error;
    }
  }

  private makeHttpsRequest(
    options: https.RequestOptions,
    data: string,
  ): Promise<CheckoutResponse> {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          try {
            const jsonResponse = JSON.parse(body);
            resolve(jsonResponse);
          } catch (error) {
            reject(new Error('Failed to parse response'));
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
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
