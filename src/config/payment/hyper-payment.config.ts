/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { registerAs } from '@nestjs/config';

const token = process.env.HYPERPAY_TOKEN;
const baseUrl = process.env.HYPERPAY_BASE_URL;
const entityIdForDb = process.env.HYPERPAY_ENTITY_ID_FOR_DB;
const entityIdForPA = process.env.HYPERPAY_ENTITY_ID_FOR_PA;
const frontendUrl = process.env.FRONT_END_URL;
const merchantToken = process.env.HYPERPAY_MERCHANT_TOKEN;

export type HyperpayConfig = {
  token: string;
  baseUrl: string;
  entityIdForDb: string;
  entityIdForPA: string;
  frontendUrl: string;
  merchantToken: string;
};

// If (!token || !baseUrl) {
//   Throw new Error(
//     'Missing configuration. Please ensure you provided HYPERPAY_TOKEN | HYPERPAY_BASE_URL | HYPERPAY_ENTITY_ID',
//   );
// }
const getHyperpayConfig = (): HyperpayConfig => ({
  token: token,
  baseUrl: baseUrl,
  entityIdForDb: entityIdForDb,
  entityIdForPA: entityIdForPA,
  frontendUrl: frontendUrl,
  merchantToken: merchantToken,
});

export const getHyperpayConfigName = () => 'hyperpayConfig';
export default registerAs(getHyperpayConfigName(), getHyperpayConfig);
