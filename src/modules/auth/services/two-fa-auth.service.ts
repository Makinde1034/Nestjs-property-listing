/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { BadRequestException, Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { AppStrings } from 'src/common/messages/app.strings';

@Injectable()
export class TwoFactorAuthenticationService {
  generateTwoFactorAuthenticationSecret(email: string) {
    try {
      const secret = speakeasy.generateSecret({
        name: `${AppStrings.APP_NAME}:${email}`,
        issuer: AppStrings.APP_NAME,
        length: 32,
      });
      return secret.base32;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  generateTwoFactorAuthenticationToken(secret: string) {
    return speakeasy.totp({
      secret,
      encoding: 'base32',
    });
  }

  validateTwoFactorAuthenticationToken(token: string, secret: string): boolean {
    try {
      const result = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 6,
      });
      return result;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async generateTwoFactorOtpUrl(
    email: string,
    name: string,
    secret: string,
  ): Promise<string> {
    const otpAuthUrl = speakeasy.otpauthURL({
      secret: secret,
      label: `${AppStrings.APP_NAME}:${name}`,
      issuer: AppStrings.APP_NAME,
      encoding: 'base32',
    });
    const code = await this.generateQrcodeImage(otpAuthUrl);
    return code;
  }

  async generateQrcodeImage(authUrl: string) {
    return await QRCode.toDataURL(authUrl);
  }
}
