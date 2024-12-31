/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatActivityLog1730113346028 implements MigrationInterface {
  name = 'CreatActivityLog1730113346028';

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
      `CREATE TABLE "activity_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid, "action" character varying NOT NULL, "scope" character varying NOT NULL, "details" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_067d761e2956b77b14e534fd6f1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_067d761e2956b77b14e534fd6f" ON "activity_log" ("id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "use"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "use" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-10-28T11:02:27.718Z"'`,
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
    await queryRunner.query(
      `ALTER TABLE "activity_log" ADD CONSTRAINT "FK_d19abacc8a508c0429478ad166b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity_log" DROP CONSTRAINT "FK_d19abacc8a508c0429478ad166b"`,
    );
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
      `ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '2024-10-22 10:42:11.524'`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "use"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "use" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_067d761e2956b77b14e534fd6f"`,
    );
    await queryRunner.query(`DROP TABLE "activity_log"`);
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
