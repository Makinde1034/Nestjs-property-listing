/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import postgresConfig from './database/postgres/postgres.config';
import authConfig from './auth/auth.config';
import recaptchaConfig from './recpatcha/recaptcha.config';

export default [postgresConfig, authConfig, recaptchaConfig];
