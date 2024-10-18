/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { registerAs } from '@nestjs/config';

const token = process.env.HYPERPAY_TOKEN;
const baseUrl = process.env.HYPERPAY_BASE_URL;
const entityId = process.env.HYPERPAY_ENTITY_ID;
const frontendUrl = process.env.FRONT_END_URL;

export type NafathConfig = {
  token: string;
  baseUrl: string;
  entityId: string;
  frontendUrl: string;
};

// If (!token || !baseUrl) {
//   Throw new Error(
//     'Missing configuration. Please ensure you provided HYPERPAY_TOKEN | HYPERPAY_BASE_URL | HYPERPAY_ENTITY_ID',
//   );
// }

const getNafathConfig = (): NafathConfig => ({
  token: token,
  baseUrl: baseUrl,
  entityId: entityId,
  frontendUrl: frontendUrl,
});

export const getNafathConfigName = () => 'nafathConfig';
export default registerAs(getNafathConfigName(), getNafathConfig);
