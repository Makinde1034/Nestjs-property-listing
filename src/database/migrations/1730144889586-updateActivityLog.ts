/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateActivityLog1730144889586 implements MigrationInterface {
  name = 'UpdateActivityLog1730144889586';

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
    await queryRunner.query(`ALTER TABLE "activity_log" DROP COLUMN "scope"`);
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
    await queryRunner.query(`ALTER TABLE "activity_log" ADD "adminId" uuid`);
    await queryRunner.query(`ALTER TABLE "activity_log" ADD "ticketId" uuid`);
    await queryRunner.query(`ALTER TABLE "activity_log" ADD "roleId" integer`);
    await queryRunner.query(
      `ALTER TABLE "activity_log" ADD "responseTemplateId" uuid`,
    );
    await queryRunner.query(`ALTER TABLE "activity_log" ADD "listingId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "activity_log" ADD "articleId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" ADD "splashScreenId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" ADD "listingTypeId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-10-28T19:48:11.030Z"'`,
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
      `ALTER TABLE "activity_log" ADD CONSTRAINT "FK_3d1a44ff0e61fef285295c3e5f5" FOREIGN KEY ("adminId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" ADD CONSTRAINT "FK_584561a2ef7388a60b2da6dc941" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" ADD CONSTRAINT "FK_db83e3c5b6fd7d08c133400f430" FOREIGN KEY ("listingTypeId") REFERENCES "listing_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" ADD CONSTRAINT "FK_6e20dbf1d4b30f3096aecfc43de" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" ADD CONSTRAINT "FK_2e71d075f763f61961b6818661b" FOREIGN KEY ("responseTemplateId") REFERENCES "response_template"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" ADD CONSTRAINT "FK_de66c3ae2be1326ff507b014807" FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" ADD CONSTRAINT "FK_e98e158bbd4c9251f28d6a43966" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" ADD CONSTRAINT "FK_0fa3a610ed1a92ffd06e5e16f65" FOREIGN KEY ("splashScreenId") REFERENCES "splash_screen"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity_log" DROP CONSTRAINT "FK_0fa3a610ed1a92ffd06e5e16f65"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" DROP CONSTRAINT "FK_e98e158bbd4c9251f28d6a43966"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" DROP CONSTRAINT "FK_de66c3ae2be1326ff507b014807"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" DROP CONSTRAINT "FK_2e71d075f763f61961b6818661b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" DROP CONSTRAINT "FK_6e20dbf1d4b30f3096aecfc43de"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" DROP CONSTRAINT "FK_db83e3c5b6fd7d08c133400f430"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" DROP CONSTRAINT "FK_584561a2ef7388a60b2da6dc941"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" DROP CONSTRAINT "FK_3d1a44ff0e61fef285295c3e5f5"`,
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
      `ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '2024-10-28 11:02:27.718'`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" DROP COLUMN "listingTypeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" DROP COLUMN "splashScreenId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" DROP COLUMN "articleId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" DROP COLUMN "listingId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" DROP COLUMN "responseTemplateId"`,
    );
    await queryRunner.query(`ALTER TABLE "activity_log" DROP COLUMN "roleId"`);
    await queryRunner.query(
      `ALTER TABLE "activity_log" DROP COLUMN "ticketId"`,
    );
    await queryRunner.query(`ALTER TABLE "activity_log" DROP COLUMN "adminId"`);
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
      `ALTER TABLE "activity_log" ADD "scope" character varying NOT NULL`,
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
