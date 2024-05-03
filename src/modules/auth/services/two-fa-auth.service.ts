/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { AppStrings } from 'src/common/messages/app.strings';

@Injectable()
export class TwoFactorAuthenticationService {
  generateTwoFactorAuthenticationSecret(email: string) {
    const secret = speakeasy.generateSecret({
      name: `${AppStrings.APP_NAME}:${email}`,
      issuer: AppStrings.APP_NAME,
    });
    return secret.base32;
  }

  generateTwoFactorAuthenticationToken(secret: string) {
    return speakeasy.totp({
      secret,
      encoding: 'base32',
    });
  }

  validateTwoFactorAuthenticationToken(token: string, secret: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1,
    });
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
    });
    const code = await this.generateQrcodeImage(otpAuthUrl);
    return code;
  }

  async generateQrcodeImage(authUrl: string) {
    return await QRCode.toDataURL(authUrl);
  }
}
