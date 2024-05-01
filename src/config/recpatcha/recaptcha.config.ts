/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { registerAs } from '@nestjs/config';
import { GoogleRecaptchaModuleOptions } from '@nestlab/google-recaptcha';
import { IncomingMessage } from 'http';

export default registerAs('recaptcha', () => {
  return <GoogleRecaptchaModuleOptions>{
    secretKey: process.env.GOOGLE_RECAPTCHA_SECRET_KEY,
    response: (req: IncomingMessage) =>
      (req.headers.recaptcha || '').toString(),
    skipIf: process.env.NODE_ENV !== 'production',
    score: 0.8,
  };
});
