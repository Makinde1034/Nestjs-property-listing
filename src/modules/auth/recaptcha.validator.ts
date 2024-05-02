/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  GoogleRecaptchaException,
  GoogleRecaptchaValidator,
} from '@nestlab/google-recaptcha';

@Injectable()
export class RecaptchaValidator {
  private logger = new Logger(RecaptchaValidator.name);
  constructor(private readonly recaptchaValidator: GoogleRecaptchaValidator) {}

  async validateRecaptcha(recaptchaToken: string): Promise<void> {
    this.logger.log('Validating recaptcha....');
    const result = await this.recaptchaValidator.validate({
      response: recaptchaToken,
      score: 0.8,
      action: 'register',
    });
    this.logger.debug('Recaptcha Result', result);
    if (!result.success) {
      throw new GoogleRecaptchaException(result.errors);
    }
  }
}
