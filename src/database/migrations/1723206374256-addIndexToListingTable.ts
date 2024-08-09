/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexToListingTable1723206374256 implements MigrationInterface {
  name = 'AddIndexToListingTable1723206374256';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ticket" DROP CONSTRAINT "FK_f2884b2e973bc39c7a2f4ecdf26"`,
    );
    await queryRunner.query(
      `ALTER TABLE "parent_issue" DROP CONSTRAINT "FK_e61a31c64fd9da85d67e26bc45c"`,
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
    await queryRunner.query(
      `ALTER TABLE "parent_issue" DROP COLUMN "categoryId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "issue_category" ADD "placement" character varying NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_abcc9d10f8b8f00819eab3aaa2" ON "listing" ("listingTypeId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_33bd8a3b7eeccb95ae45038d95" ON "listing" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4c92af1ea7b04c0e38281da55d" ON "listing" ("isListingPromoted") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e1f48f7f8674d38d01384f5521" ON "listing" ("isListingFlagged") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_09cd578ebe1e22b50a621e8b4d" ON "listing" ("isListingSold") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8de4f2fb82ad27dca8aadea292" ON "listing" ("isListingRented") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9328c84deae5bdd71ff6d374a9" ON "listing" ("isListingFeatured") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_88f272f63636da061672b89877" ON "listing" ("isListingDisabled") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6822457d557ca936db1ac66702" ON "listing" ("createdAt") `,
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
      `ALTER TABLE "ticket" ADD CONSTRAINT "FK_f2884b2e973bc39c7a2f4ecdf26" FOREIGN KEY ("issueId") REFERENCES "issue"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ticket" DROP CONSTRAINT "FK_f2884b2e973bc39c7a2f4ecdf26"`,
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
      `DROP INDEX "public"."IDX_6822457d557ca936db1ac66702"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_88f272f63636da061672b89877"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9328c84deae5bdd71ff6d374a9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8de4f2fb82ad27dca8aadea292"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_09cd578ebe1e22b50a621e8b4d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e1f48f7f8674d38d01384f5521"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4c92af1ea7b04c0e38281da55d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_33bd8a3b7eeccb95ae45038d95"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_abcc9d10f8b8f00819eab3aaa2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "issue_category" DROP COLUMN "placement"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "parent_issue" ADD "categoryId" uuid`);
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
      `ALTER TABLE "parent_issue" ADD CONSTRAINT "FK_e61a31c64fd9da85d67e26bc45c" FOREIGN KEY ("categoryId") REFERENCES "issue_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket" ADD CONSTRAINT "FK_f2884b2e973bc39c7a2f4ecdf26" FOREIGN KEY ("issueId") REFERENCES "parent_issue"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
