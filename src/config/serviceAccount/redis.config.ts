/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { registerAs } from '@nestjs/config';

const host = process.env.REDIS_HOST;
const password = process.env.REDIS_PASSWORD;
const port = parseInt(process.env.REDIS_PORT, 10) ?? 6379;

export type RedisConfig = {
  host: string;
  password: string;
  port: number;
};

const getRedisConfig = (): RedisConfig => ({
  host: host,
  password: password,
  port: port,
});

export const getRedisConfigName = () => 'redis';
export default registerAs(getRedisConfigName(), getRedisConfig);
