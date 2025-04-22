/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import * as querystring from 'querystring';

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
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import {
  HyperpayConfig,
  getHyperpayConfigName,
} from '../../../config/payment/hyper-payment.config';
import {
  CapturePaymentData,
  CheckoutResponse,
  InitiatePaymentInput,
  PaymentRequest,
  PreAuthorisedPaymentInput,
  RefundPaymentData,
} from '../dto/request/payment.input';
import { AxiosRequestConfig } from 'axios';
import { User } from '../../../entities';
import { AdminService } from '../../admin/services/admin.service';
import {
  CapturePaymentResponse,
  PreAuthorisedPaymentResponse,
} from '../dto/response/payment.response';
import Decimal from 'decimal.js';

@Injectable()
export class HyperPayService {
  private readonly logger = new Logger(HyperPayService.name);
  private readonly hyperPayConfig: HyperpayConfig;
  private readonly options: AxiosRequestConfig;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly adminService: AdminService,
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
    reference: string,
  ) {
    try {
      const adminDefault = await this.adminService.adminDefault();

      const amount = new Decimal(initiatePaymentInput.amount).toFixed(2);

      const payload: PaymentRequest = {
        entityId: this.hyperPayConfig.entityIdForDb,
        currency: 'SAR',
        amount: amount,
        paymentType: 'DB',
        integrity: true,
        merchantInvoiceId: reference,
        merchantTransactionId: adminDefault?.merchantTransactionId,
      };

      const requestPayload = querystring.stringify(payload as any);

      const response = await lastValueFrom(
        this.httpService.post<PreAuthorisedPaymentResponse>(
          this.hyperPayConfig.baseUrl + '/v1/checkouts',
          requestPayload,
          this.options,
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error('Error creating checkout', error);

      if (error instanceof HttpException) {
        throw error;
      } else if (error.isAxiosError) {
        throw new InternalServerErrorException(
          error.response?.data?.message || 'Payment service error',
        );
      } else {
        throw new InternalServerErrorException(error.message);
      }
    }
  }

  async createCheckoutForPA(
    initiatePaymentInput: InitiatePaymentInput,
    user: User,
    reference: string,
  ) {
    try {
      const adminDefault = await this.adminService.adminDefault();

      const amount = new Decimal(initiatePaymentInput.amount).toFixed(2);

      const payload: PaymentRequest = {
        entityId: this.hyperPayConfig.entityIdForPA,
        amount: amount,
        currency: 'SAR',
        paymentType: 'PA',
        integrity: true,
        // merchantInvoiceId: reference,
        // 'customParameters[3DS2_enrolled]': true,
        // 'customParameters[3DS2_flow]': 'challenge',
        // merchantTransactionId: adminDefault?.merchantTransactionId,
      };

      const requestPayload = querystring.stringify(payload as any);

      const response = await lastValueFrom(
        this.httpService.post<PreAuthorisedPaymentResponse>(
          this.hyperPayConfig.baseUrl + '/v1/checkouts',
          requestPayload,
          this.options,
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error('Error creating checkout', error);

      if (error instanceof HttpException) {
        throw error;
      } else if (error.isAxiosError) {
        throw new InternalServerErrorException(
          error.response?.data?.message || 'Payment service error',
        );
      } else {
        throw new InternalServerErrorException(error.message);
      }
    }
  }

  async verifyPayment(checkoutId: string) {
    try {
      const response = this.httpService.get(
        this.hyperPayConfig.baseUrl +
          `/v1/checkouts/${checkoutId}/payment?entityId=${this.hyperPayConfig.entityIdForPA}`,
        this.options,
      );

      const data = await (await lastValueFrom(response)).data;

      return data;
    } catch (error) {
      this.logger.error('Error verifying payment', error);
      if (error instanceof HttpException) {
        throw error;
      } else if (error.isAxiosError) {
        throw new BadRequestException(
          error.response?.data?.message || 'Error verifying payment',
        );
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }
  async verifyPaymentForDb(checkoutId: string) {
    try {
      const response = this.httpService.get(
        this.hyperPayConfig.baseUrl +
          `/v1/checkouts/${checkoutId}/payment?entityId=${this.hyperPayConfig.entityIdForDb}`,
        this.options,
      );

      const data = await (await lastValueFrom(response)).data;

      return data;
    } catch (error) {
      this.logger.error('Error verifying payment', error);
      if (error instanceof HttpException) {
        throw error;
      } else if (error.isAxiosError) {
        throw new BadRequestException(
          error.response?.data?.message || 'Error verifying payment',
        );
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }

  async capturePayment(capturePayment: CapturePaymentData,paymentId:string) {
    try {
      const payload = querystring.stringify({
        entityId: this.hyperPayConfig.entityIdForPA,
        amount: capturePayment.amount,
        paymentType: 'CP',
        currency: 'SAR',
      });

      const response = await lastValueFrom(
        this.httpService.post<CapturePaymentResponse>(
          this.hyperPayConfig.baseUrl + `/v1/payments/${paymentId}`,
          payload,
          this.options,
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error('Error in payment pre-authorization', error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }

  async refundPayment(capturePayment: RefundPaymentData) {
    try {
      const payload = querystring.stringify({
        entityId: this.hyperPayConfig.entityIdForDb,
        amount: capturePayment.amount,
        paymentType: 'RF',
        currency: 'SAR',
      });

      const response = await lastValueFrom(
        this.httpService.post<CapturePaymentResponse>(
          this.hyperPayConfig.baseUrl + `/payments${capturePayment.paymentId}`,
          payload,
          this.options,
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error('Error in payment pre-authorization', error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }
  async refundPaymentPA(capturePayment: RefundPaymentData) {
    try {
      const payload = querystring.stringify({
        entityId: this.hyperPayConfig.entityIdForPA,
        amount: capturePayment.amount,
        paymentType: 'RF',
        currency: 'SAR',
      });

      const response = await lastValueFrom(
        this.httpService.post<CapturePaymentResponse>(
          this.hyperPayConfig.baseUrl + `/payments${capturePayment.paymentId}`,
          payload,
          this.options,
        ),
      );
      return response.data;
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
