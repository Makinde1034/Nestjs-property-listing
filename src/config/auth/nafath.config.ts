/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { registerAs } from '@nestjs/config';

const key = process.env.NAFATH_KEY;
const baseUrl = process.env.NAFATH_BASE_URL;
const nafathAction = process.env.NAFATH_ACTION;
const NafathId = process.env.NAFATH_ID;
const NafthService = process.env.NAFATH_SERVICE;

console.log(process.env.NAFATH_TOKEN);

export type NafathConfig = {
  key: string;
  baseUrl: string;
  nafathAction: string;
  NafathId: string;
  NafthService: string;
};

// if (!key || !baseUrl) {
//   throw new Error(
//     'Cannot find configuration for Nafath. Please ensure you  them provided ',
//   );
// }
const getNafathConfig = (): NafathConfig => ({
  key: key,
  baseUrl: baseUrl,
  nafathAction: nafathAction,
  NafathId: NafathId,
  NafthService: NafthService,
});

export const getNafathConfigName = () => 'nafathConfig';
export default registerAs(getNafathConfigName(), getNafathConfig);
