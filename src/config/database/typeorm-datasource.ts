/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource, DataSourceOptions } from 'typeorm';
import { typeOrmPostgresOptions } from './postgres/postgres.config';
import { config } from 'dotenv';
import { Logger } from '@nestjs/common';
import { database } from 'firebase-admin';

/**
 * This data source is used for Typeorm migration that runs outside of Nestjs
 */

config({
  path: process.env.NODE_ENV === 'development' ? '.env.local' : '.env',
});

const connectionSource = {
  ...typeOrmPostgresOptions,
  url: process.env.DATABASE_URL,
  seeds: ['dist/**/*.seeder{.ts,.js}'],
  extra: {
    max: 20, // Pool size: adjust based on your load
    connectionTimeoutMillis: 2000, // Timeout for establishing a connection
    idleTimeoutMillis: 10000, // Timeout for idle connections
  },
};

const AppDataSource = new DataSource(connectionSource as DataSourceOptions);

async function initializeDataSource() {
  try {
    await AppDataSource.initialize();
    Logger.log('Data Source has been initialized!', 'DatabaseConnection');
  } catch (err) {
    Logger.error('Error during Data Source initialization, retrying...', err);
    setTimeout(initializeDataSource, 5000); // Retry after 5 seconds
  }
}

initializeDataSource();

export default AppDataSource;
