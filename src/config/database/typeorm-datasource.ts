import { DataSource, DataSourceOptions } from 'typeorm';
import { typeOrmPostgresOptions } from './postgres/postgres.config';
import { config } from 'dotenv';

/**
 * This data source is used for Typeorm migration that runs outside of Nestjs
 */

config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const connectionSource = {
  ...typeOrmPostgresOptions,
  url: process.env.DATABASE_URL,
  seeds: ['dist/**/*.seeder{.ts,.js}'],
};

const AppDataSource = new DataSource(connectionSource as DataSourceOptions);

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });

export default AppDataSource;
