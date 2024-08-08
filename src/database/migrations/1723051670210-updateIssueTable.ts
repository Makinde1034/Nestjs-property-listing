/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateIssueTable1723051670210 implements MigrationInterface {
  name = 'UpdateIssueTable1723051670210';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ticket" DROP CONSTRAINT "FK_3f8d0cbf562ddfcbc4c69fa4cd8"`,
    );
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
    await queryRunner.query(`ALTER TABLE "issue" DROP COLUMN "closedAt"`);
    await queryRunner.query(`ALTER TABLE "issue" DROP COLUMN "reviewedAt"`);
    await queryRunner.query(
      `ALTER TABLE "issue" DROP COLUMN "parentArabicName"`,
    );
    await queryRunner.query(
      `ALTER TABLE "issue" DROP COLUMN "childArabicName"`,
    );
    await queryRunner.query(`ALTER TABLE "issue" DROP COLUMN "isClosed"`);
    await queryRunner.query(
      `ALTER TABLE "ticket" DROP COLUMN "issueCategoryId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "issue" ADD "parentArabicReason" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "issue" ADD "childArabicReason" character varying`,
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
      `ALTER TABLE "issue" DROP COLUMN "childArabicReason"`,
    );
    await queryRunner.query(
      `ALTER TABLE "issue" DROP COLUMN "parentArabicReason"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "ticket" ADD "issueCategoryId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "issue" ADD "isClosed" character varying NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "issue" ADD "childArabicName" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "issue" ADD "parentArabicName" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "issue" ADD "reviewedAt" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "issue" ADD "closedAt" TIMESTAMP`);
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
    await queryRunner.query(
      `ALTER TABLE "ticket" ADD CONSTRAINT "FK_3f8d0cbf562ddfcbc4c69fa4cd8" FOREIGN KEY ("issueCategoryId") REFERENCES "issue_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
