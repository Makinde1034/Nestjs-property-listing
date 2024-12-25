/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import postgresConfig from './database/postgres/postgres.config';
import authConfig from './auth/auth.config';
import recaptchaConfig from './recpatcha/recaptcha.config';
import appDefault from './app-default/app-default';
import nafathConfig from './auth/nafath.config';
import hyperPaymentConfig from './payment/hyper-payment.config';
import webHookConfig from './payment/web-hook.config';
import firebaseConfig from './serviceAccount/firebase.config';

export default [
  //   postgresConfig,
  //   authConfig,
  //   recaptchaConfig,
  postgresConfig,
  authConfig,
  recaptchaConfig,
  hyperPaymentConfig,
  webHookConfig,
  appDefault,
  nafathConfig,
  firebaseConfig,
];
