/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { registerAs } from '@nestjs/config';

const hyperPayDecriptionToken = process.env.HYPERPAY_DECRIPTION_TOKEN;

export type WebhookConfig = {
  hyperPayDecriptionToken: string;
};

// If (!hyperPayDecriptionToken ) {
//   Throw new Error(
//     'Missing configuration. Please ensure you provided  Hyperpay Webhook_TOKEN ',
//   );
// }

const getWebhookConfig = (): WebhookConfig => ({
  hyperPayDecriptionToken: hyperPayDecriptionToken,
});
export const getWebhookConfigName = () => 'WebhookConfig';
export default registerAs(getWebhookConfigName(), getWebhookConfig);
