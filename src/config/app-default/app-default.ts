/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { registerAs } from '@nestjs/config';

const customerFrontEndUrl = process.env.FRONT_END_URL;
const adminFrontEndUrl = process.env.ADMIN_FRONTEND_URL;

export type AppDefaultConfig = {
  adminFrontEndUrl: string;
  customerFrontEndUrl: string;
};

if (!customerFrontEndUrl || !adminFrontEndUrl) {
  throw new Error(
    'Missing configuration. Please ensure you provided FRONT_END_URL | ADMIN_FRONTEND_URL',
  );
}

const getAppDefaultConfig = (): AppDefaultConfig => ({
  customerFrontEndUrl: customerFrontEndUrl,
  adminFrontEndUrl: adminFrontEndUrl,
});

export const getAappDefaultConfigName = () => 'appDefaultConfig';
export default registerAs(getAappDefaultConfigName(), getAppDefaultConfig);
