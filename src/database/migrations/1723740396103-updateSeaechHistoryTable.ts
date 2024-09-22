/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSeaechHistoryTable1723740396103
  implements MigrationInterface
{
  name = 'UpdateSeaechHistoryTable1723740396103';

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
    await queryRunner.query(`ALTER TABLE "search_history" DROP COLUMN "price"`);
    await queryRunner.query(
      `ALTER TABLE "search_history" DROP COLUMN "location"`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_history" DROP COLUMN "numberOfBathrooms"`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_history" DROP COLUMN "numberOfRooms"`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_history" DROP COLUMN "listingType"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_history" ADD "minPrice" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_history" ADD "maxPrice" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_history" ADD "minArea" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_history" ADD "maxArea" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_history" ADD "gpsCoordinate" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_history" ADD "attributes" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_history" ADD "listingId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_history" ALTER COLUMN "isValid" SET DEFAULT false`,
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
      `ALTER TABLE "search_history" ALTER COLUMN "isValid" SET DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_history" DROP COLUMN "listingId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_history" DROP COLUMN "attributes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_history" DROP COLUMN "gpsCoordinate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_history" DROP COLUMN "maxArea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_history" DROP COLUMN "minArea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_history" DROP COLUMN "maxPrice"`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_history" DROP COLUMN "minPrice"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_history" ADD "listingType" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_history" ADD "numberOfRooms" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_history" ADD "numberOfBathrooms" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_history" ADD "location" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "search_history" ADD "price" integer`);
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
