/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddArabicNamesToUserTable1715853140870
  implements MigrationInterface
{
  name = 'AddArabicNamesToUserTable1715853140870';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "arabicFirstName" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "arabicLastName" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "arabicMiddleName" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "arabicMiddleName"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "arabicLastName"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "arabicFirstName"`);
  }
}
