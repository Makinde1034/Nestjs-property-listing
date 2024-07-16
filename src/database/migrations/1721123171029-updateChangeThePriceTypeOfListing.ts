/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateChangeThePriceTypeOfListing1721123171029
  implements MigrationInterface
{
  name = 'UpdateChangeThePriceTypeOfListing1721123171029';

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
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "price" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "numberOfBathrooms"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "numberOfBathrooms" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "numberOfRooms"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "numberOfRooms" integer NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "landArea"`);
    await queryRunner.query(`ALTER TABLE "listing" ADD "landArea" integer`);
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "areaOfApartment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "areaOfApartment" integer`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "totalArea"`);
    await queryRunner.query(`ALTER TABLE "listing" ADD "totalArea" integer`);
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
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "totalArea"`);
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "totalArea" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "areaOfApartment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "areaOfApartment" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "landArea"`);
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "landArea" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "numberOfRooms"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "numberOfRooms" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "numberOfBathrooms"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "numberOfBathrooms" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "price" SET DEFAULT '2000'`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
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
