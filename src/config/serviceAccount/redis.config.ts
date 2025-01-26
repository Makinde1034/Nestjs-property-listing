/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { registerAs } from '@nestjs/config';

const host = process.env.REDIS_HOST;
const password = process.env.REDIS_PASSWORD;

export type RedisConfig = {
  host: string;
  password: string;
};

const getRedisConfig = (): RedisConfig => ({
  host: host,
  password: password,
});

export const getRedisConfigName = () => 'redis';
export default registerAs(getRedisConfigName(), getRedisConfig);
