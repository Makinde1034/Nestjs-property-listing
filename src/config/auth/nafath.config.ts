/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { registerAs } from '@nestjs/config';

const key = process.env.NAFATH_TOKEN;
const baseUrl = process.env.NAFATH_BASE_URL;

export type NafathConfig = {
  key: string;
  baseUrl: string;
};

// If (!token || !baseUrl) {
//   Throw new Error(
//     'Missing configuration. Please ensure you provided HYPERPAY_TOKEN | HYPERPAY_BASE_URL | HYPERPAY_ENTITY_ID',
//   );
// }

const getNafathConfig = (): NafathConfig => ({
  key: key,
  baseUrl: baseUrl,
});

export const getNafathConfigName = () => 'nafathConfig';
export default registerAs(getNafathConfigName(), getNafathConfig);
