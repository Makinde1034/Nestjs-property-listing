/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserAddCrAndZatcaColumn1727778753422
  implements MigrationInterface
{
  name = 'UpdateUserAddCrAndZatcaColumn1727778753422';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "use"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "use" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "crNumber" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "zatcaNuber" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice" ADD "file" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-10-01T10:32:34.789Z"'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '2024-09-30 17:59:11.897'`,
    );
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "file"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "zatcaNuber"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "crNumber"`);
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "use"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "use" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
