import { DataSource, DataSourceOptions } from 'typeorm';
import { typeOrmPostgresOptions } from './postgres/postgres.config';
import { config } from 'dotenv';

/**
 * This data source is used for Typeorm migration that runs outside of Nestjs
 */

config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const AppDataSource = new DataSource({
  ...typeOrmPostgresOptions,
  url: process.env.DATABASE_URL,
} as DataSourceOptions);

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });

export default AppDataSource;
