/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUserTable1714472784545 implements MigrationInterface {
  name = 'AlterUserTable1714472784545';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_c28e52f758e7bbc53828db92194"`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_role_roles" ("userId" uuid NOT NULL, "roleId" integer NOT NULL, CONSTRAINT "PK_8a60a793daad1aa7a25a731bbc5" PRIMARY KEY ("userId", "roleId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cba63220dbbad6883f3c6e3ee6" ON "user_role_roles" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bd5b032b1b0c4d746b8e4cd9bf" ON "user_role_roles" ("roleId") `,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "roleId"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "middleName" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "status" character varying DEFAULT 'PENDING'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "employeeId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_ab4a80281f1e8d524714e00f38f" UNIQUE ("employeeId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_03bb2f4ae327fc5257d9d677b7" ON "user" ("userType") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_roles" ADD CONSTRAINT "FK_cba63220dbbad6883f3c6e3ee65" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_roles" ADD CONSTRAINT "FK_bd5b032b1b0c4d746b8e4cd9bfc" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_role_roles" DROP CONSTRAINT "FK_bd5b032b1b0c4d746b8e4cd9bfc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_roles" DROP CONSTRAINT "FK_cba63220dbbad6883f3c6e3ee65"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_03bb2f4ae327fc5257d9d677b7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_ab4a80281f1e8d524714e00f38f"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "employeeId"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "status"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "middleName"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "roleId" integer`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bd5b032b1b0c4d746b8e4cd9bf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cba63220dbbad6883f3c6e3ee6"`,
    );
    await queryRunner.query(`DROP TABLE "user_role_roles"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_c28e52f758e7bbc53828db92194" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
