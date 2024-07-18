/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateListingTable1721317418807 implements MigrationInterface {
  name = 'UpdateListingTable1721317418807';

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
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "featured"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "landArea"`);
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "propertyNumber"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "listing" ADD "area" integer`);
    await queryRunner.query(`ALTER TABLE "listing" ADD "totalArea" integer`);
    await queryRunner.query(`ALTER TABLE "listing" ADD "garageArea" integer`);
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "powerOfAttorney" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "name" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "purpose" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "rentingOption" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "address" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "city" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "country" SET NOT NULL`,
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
      `ALTER TABLE "listing" ALTER COLUMN "country" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "city" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "address" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "rentingOption" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "purpose" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "name" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "powerOfAttorney" DROP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "garageArea"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "totalArea"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "area"`);
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "propertyNumber" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "listing" ADD "landArea" integer`);
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "featured" boolean NOT NULL DEFAULT false`,
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
