/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

// Import { User } from '../../../entities';
// Import {
//   CheckoutResponse,
//   InitiatePaymentInput,
// } from '../dto/request/payment.input';
// Import {
//   HyperpayConfig,
//   GetHyperpayConfigName,
// } from '../../../config/payment/hyper-payment.config';

// @Injectable()
// Export class HyperPayService {
//   Private readonly logger = new Logger(HyperPayService.name);
//   Private hyperPayConfig: HyperpayConfig;
//   Private readonly options: AxiosRequestConfig;

//   Constructor(
//     Private httpService: HttpService,
//     Private configService: ConfigService,
//   ) {
//     This.hyperPayConfig = this.configService.get<HyperpayConfig>(
//       GetHyperpayConfigName(),
//     );

//     This.options = {
//       Headers: {
//         Authorization: `Bearer ${this.hyperPayConfig.token}`,
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//     };
//   }

//   Async createCheckout(
//     InitiatePaymentInput: InitiatePaymentInput,
//     User: User,
//   ): Promise<CheckoutResponse> {
//     Try {
//       This.logger.log('createCheckout', initiatePaymentInput, user);
//       Const payload = {
//         EntityId: process.env.HYPERPAY_ENTITY_ID,
//         Amount: initiatePaymentInput.amount,
//         Currency: 'SAR', // Changed to SAR as per the documentation
//         PaymentType: 'DB',
//         'customer.email': user.email,
//         'customer.givenName': user.firstName,
//         'customer.surname': user.lastName,
//         'billing.city': user.city,
//         'billing.country': user.nationality,

//         MerchantTransactionId: '12345',
//       };

//       Const data = querystring.stringify(payload as any);
//       Const options = {
//         Port: 443,
//         Host: 'eu-test.oppwa.com', // Updated host
//         Path: '/v1/checkouts',
//         Method: 'POST',
//         Headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//           'Content-Length': data.length,
//           Authorization: `Bearer ${process.env.HYPERPAY_TOKEN}`,
//         },
//       };

//       Const checkoutResponse: CheckoutResponse = await this.makeHttpsRequest(
//         Options,
//         Data,
//       );
//       Return checkoutResponse;
//     } catch (error) {
//       This.logger.error('Error creating checkout', error);
//       If (error instanceof HttpException) {
//         Throw error;
//       } else {
//         Throw new BadRequestException(error.message);
//       }
//     }
//   }

//   Async verifyPayment(checkoutId: string): Promise<any> {
//     Try {
//       Const path = `/v1/checkouts/${checkoutId}/payment?entityId=${process.env.HYPERPAY_ENTITY_ID}`;

//       Const options = {
//         Port: 443,
//         Host: 'eu-test.oppwa.com',
//         Path: path,
//         Method: 'GET',
//         Headers: {
//           Authorization: `Bearer ${process.env.HYPERPAY_TOKEN}`,
//         },
//       };

//       Const payload = {
//         EntityId: process.env.HYPERPAY_ENTITY_ID, // Updated entityId
//       };

//       Const data = querystring.stringify(payload);

//       Const response = await this.makeHttpsRequest(options, data);

//       Return response;
//     } catch (error) {
//       This.logger.error('Error verifying payment', error);
//       Throw error;
//     }
//   }

//   Private makeHttpsRequest(
//     Options: https.RequestOptions,
//     Data: string,
//   ): Promise<CheckoutResponse> {
//     Return new Promise((resolve, reject) => {
//       Const req = https.request(options, (res) => {
//         Const chunks: Buffer[] = [];
//         Res.on('data', (chunk: Buffer) => chunks.push(chunk));
//         Res.on('end', () => {
//           Const body = Buffer.concat(chunks).toString('utf8');
//           Try {
//             Const jsonResponse = JSON.parse(body);
//             Resolve(jsonResponse);
//           } catch (error) {
//             Reject(new Error('Failed to parse response'));
//           }
//         });
//       });

//       Req.on('error', reject);
//       Req.write(data);
//       Req.end();
//     });
//   }

//   Async checkPaymentStatus(checkoutId: string) {
//     Const requestPayload1 = new URLSearchParams(checkoutId).toString();

//     Const requestpayload2 = new URLSearchParams({
//       EntityId: this.hyperPayConfig.entityId,
//     }).toString();

//     Const response = this.httpService.get(
//       This.hyperPayConfig.baseUrl +
//         `checkouts/${requestPayload1}/payment?${requestpayload2}`,
//       This.options,
//     );

//     Const data = await (await lastValueFrom(response)).data;

//     Return data;
//   }
// }

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

  async createCheckout(initiatePaymentInput: InitiatePaymentInput, user: User) {
    try {
      const adminDefault = await this.adminService.adminDefault();

      const payload: PaymentRequest = {
        entityId: this.hyperPayConfig.entityId,
        amount: initiatePaymentInput.amount,
        currency: 'SAR',
        paymentType: 'DB',
        integrity: true,
        'customer.email': user.email,
        'customer.givenName': user.firstName,
        'customer.surname': user.lastName,
        'customer.city': user.city,
        'customer.country': user.nationality,
        merchantTransactionId: adminDefault?.merchantTransactionId,
      };

      const requestPayload = querystring.stringify(payload as any);

      const response = await lastValueFrom(
        this.httpService.post<PreAuthorisedPaymentResponse>(
          this.hyperPayConfig.baseUrl + '/checkouts',
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
        throw new BadRequestException(
          error.response?.data?.message || 'Payment service error',
        );
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }

  async verifyPayment(checkoutId: string) {
    try {
      const response = this.httpService.get(
        this.hyperPayConfig.baseUrl +
          `/checkouts/${checkoutId}/payment?entityId=${this.hyperPayConfig.entityId}`,
        this.options,
      );

      const data = await (await lastValueFrom(response)).data;

      return data;
    } catch (error) {
      this.logger.error('Error creating checkout', error);
      if (error instanceof HttpException) {
        throw error;
      } else if (error.isAxiosError) {
        throw new BadRequestException(
          error.response?.data?.message || 'Payment service error',
        );
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }
  async preAuthorize(initiatePaymentInput: PreAuthorisedPaymentInput) {
    try {
      const adminDefault = await this.adminService.adminDefault();
      const payload = {
        entityId: this.hyperPayConfig.entityId,
        amount: initiatePaymentInput.amount,
        currency: 'SAR',
        paymentType: 'PA',
        'card.number': initiatePaymentInput.cardNumber,
        'card.holder': initiatePaymentInput.cardHolder,
        'card.expiryMonth': initiatePaymentInput.cardExpiryMonth,
        'card.expiryYear': initiatePaymentInput.cardExpiryYear,
        'card.cvv': initiatePaymentInput.cardCvv,
        merchantTransactionId: adminDefault?.merchantTransactionId,
        paymentBrand: initiatePaymentInput.paymentBrand,
      };
      console.log(payload);

      const requestPayload = querystring.stringify(payload as any);

      const response = await lastValueFrom(
        this.httpService.post<CheckoutResponse>(
          this.hyperPayConfig.baseUrl + '/payments',
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
        throw new BadRequestException(
          error.response?.data?.message || 'Payment service error',
        );
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }

  async capturePayment(capturePayment: CapturePaymentData) {
    try {
      const payload = querystring.stringify({
        entityId: this.hyperPayConfig.entityId,
        amount: capturePayment.amount,
        paymentType: 'CP',
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

  async refundPayment(capturePayment: RefundPaymentData) {
    try {
      const payload = querystring.stringify({
        entityId: this.hyperPayConfig.entityId,
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
