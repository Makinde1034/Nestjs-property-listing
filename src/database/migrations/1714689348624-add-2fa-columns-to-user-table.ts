/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class Add2faColumnsToUserTable1714689348624
  implements MigrationInterface
{
  name = 'Add2faColumnsToUserTable1714689348624';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "twoFactorAuthenticationSecret" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "isTwoFactorAuthenticationEnabled" boolean DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "isTwoFactorAuthenticationEnabled"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "twoFactorAuthenticationSecret"`,
    );
  }
}
