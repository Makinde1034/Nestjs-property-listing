/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUserTableSchemaDropIndex1714734834229
  implements MigrationInterface
{
  name = 'AlterUserTableSchemaDropIndex1714734834229';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_03bb2f4ae327fc5257d9d677b7"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_03bb2f4ae327fc5257d9d677b7" ON "user" ("userType") `,
    );
  }
}
