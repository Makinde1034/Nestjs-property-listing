/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { PaymentEnum } from '../../../common/enums/payment.enum';
import {
  WebhookConfig,
  getWebhookConfigName,
} from '../../../config/payment/web-hook.config';
import {
  WebHookPaymentResponse,
  WebHookResponse,
} from '../dto/wehook.response';

import { ConfigService } from '@nestjs/config';
import { SuccessResponse } from '../../../common/utils/success.response';
import * as crypto from 'crypto';

import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  NafathUserResponse,
  NafathWebHookResponse,
} from '../../user/dtos/response/nafath';
import { UserService } from '../../user/services';
import { JwtService } from '@nestjs/jwt';
import {
  getHyperpayConfigName,
  HyperpayConfig,
} from '../../../config/payment/hyper-payment.config';
@Injectable()
export class WebhookService {
  private readonly hyperPayConfig: HyperpayConfig;
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {
    this.hyperPayConfig = this.configService.get<HyperpayConfig>(
      getHyperpayConfigName(),
    );
  }
  logger = new Logger(WebhookService.name);

  handleWebHookForHyperpay(
    payload: WebHookResponse,
    ivfromHttpHeader: string,
    authTagFromHttpHeader: string,
  ) {
    try {
      // Data from configuration
      var secretFromConfiguration =
        '000102030405060708090a0b0c0d0e0f000102030405060708090a0b0c0d0e0f';

      // Data from server
      var ivfromHttpHeader = '000000000000000000000000';
      var authTagFromHttpHeader = 'CE573FB7A41AB78E743180DC83FF09BD';
      var httpBody = payload.encryptedBody;

      const algorithm = 'aes-256-gcm';
      // Shared secret key (from configuration)
      // const secretFromConfiguration =
      //   this.hyperPayConfig.hyperPayDecriptionToken;

      // const httpBody = payload.encryptedBody; // Should be a hex string
      // Convert hex strings to binary buffers
      const key = Buffer.from(secretFromConfiguration, 'hex');
      const iv = Buffer.from(ivfromHttpHeader, 'hex');
      const authTag = Buffer.from(authTagFromHttpHeader, 'hex');
      const cipherText = Buffer.from(httpBody, 'hex');
      const decipher = crypto.createDecipheriv(algorithm, key, iv);

      decipher.setAuthTag(authTag);

      // Decrypt the data
      const decrypted = Buffer.concat([
        decipher.update(cipherText),
        decipher.final(),
      ]).toString('utf8');
      console.log('Decrypted Payload:', decrypted);

      const data = {
        type: 'PAYMENT',
        payload: {
          id: '8a829449515d198b01517d5601df5584',
          paymentType: 'PA',
          paymentBrand: 'VISA',
          amount: '92.00',
          currency: 'EUR',
          presentationAmount: '92.00',
          presentationCurrency: 'EUR',
          descriptor: '3017.7139.1650 OPP_Channel ',
          result: {
            code: '000.000.000',
            description: 'Transaction succeeded',
          },
          authentication: {
            entityId: '8a8294185282b95b01528382b4940245',
          },
          card: {
            bin: '420000',
            last4Digits: '0000',
            holder: 'Jane Jones',
            expiryMonth: '05',
            expiryYear: '2018',
          },
          customer: {
            givenName: 'Jones',
            surname: 'Jane',
            merchantCustomerId: 'jjones',
            sex: 'F',
            email: 'jane@jones.com',
          },
          customParameters: {
            SHOPPER_promoCode: 'AT052',
          },
          risk: {
            score: '0',
          },
          buildNumber:
            'ec3c704170e54f6d7cf86c6f1969b20f6d855ce5@2015-12-01 12:20:39 +0000',
          timestamp: '2015-12-07 16:46:07+0000',
          ndc: '8a8294174b7ecb28014b9699220015ca_66b12f658442479c8ca66166c4999e78',
          channelName: 'OPP_Channel',
          source: 'SYSTEM',
          paymentMethod: 'CC',
          shortId: '5420.6916.5424',
        },
      };

      return new SuccessResponse();
    } catch (error) {
      console.log(error);
      this.logger.error('Decryption failed:', error.message);
      throw new Error('DecryptionFailed');
    }
  }

  async handleWebhookForNafath(data: NafathWebHookResponse) {
    try {
      const userData: NafathUserResponse = this.jwtService.decode(
        data.response,
      );
      await this.userService.finalizeUpgradeUser(data, userData);
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }
}
