/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { registerAs } from '@nestjs/config';
import { CamelCaseNamingStrategy } from '../../../common/utils/naming-strategy';

export const typeOrmPostgresOptions = <TypeOrmModuleOptions>{
  type: 'postgres',
  entities: ['dist/**/*.entity{.tsz,.js}'],

  migrations: ['dist/database/migrations/*{.tsz,.js}'],
  synchronize: false,
  logging: false,
  autoLoadEntities: true,
  namingStrategy: new CamelCaseNamingStrategy(),
};

export default registerAs(
  'db.postgres',
  () =>
    <TypeOrmModuleOptions>{
      ...typeOrmPostgresOptions,
      url: process.env.DATABASE_URL,
    },
);
