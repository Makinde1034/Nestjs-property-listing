/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import postgresConfig from './database/postgres/postgres.config';
import authConfig from './auth/auth.config';
import recaptchaConfig from './recpatcha/recaptcha.config';
import hyperPaymentConfig from '../../../config/payment/hyper-payment.config';
import webHookConfig from '../../../config/web-hook.config.ts/web-hook.config';
import appDefault from '../../../config/app-default/app-default';
import nafathConfig from '../../../config/auth/nafath.config';

export default [
  postgresConfig,
  authConfig,
  recaptchaConfig,
  hyperPaymentConfig,
  webHookConfig,
  appDefault,
  nafathConfig,
];
