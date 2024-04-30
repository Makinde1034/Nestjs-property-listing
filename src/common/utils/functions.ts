/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import * as crypto from 'crypto';
import * as randomstring from 'randomstring';

export const generateRandomToken = (count?: number): string =>
  randomstring.generate(count);

export const generatereference = () => {
  return crypto.randomInt(10000000, 99999999);
};

export const generateOtp = () => {
  return crypto.randomInt(1000, 9999);
};
