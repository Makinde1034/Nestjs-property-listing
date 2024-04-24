/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewColumnsToUserTable1713900492153
  implements MigrationInterface
{
  name = 'AddNewColumnsToUserTable1713900492153';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "national_identity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nationality" character varying, "type" character varying, "identityNumber" character varying, "dateOfExpiry" TIMESTAMP, "userId" uuid, CONSTRAINT "REL_d2005a69d316572ec1f42bba22" UNIQUE ("userId"), CONSTRAINT "PK_5a848d1cdeac4f186b82d252d98" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "gender" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "language" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "maritalStatus" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "occupation" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "dateOfBirth" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "profilePhoto" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "phone" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "national_identity" ADD CONSTRAINT "FK_d2005a69d316572ec1f42bba22e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "national_identity" DROP CONSTRAINT "FK_d2005a69d316572ec1f42bba22e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "phone" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "profilePhoto"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "dateOfBirth"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "occupation"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "maritalStatus"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "language"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "gender"`);
    await queryRunner.query(`DROP TABLE "national_identity"`);
  }
}
