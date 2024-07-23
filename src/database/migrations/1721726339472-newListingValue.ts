/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class NewListingValue1721726339472 implements MigrationInterface {
  name = 'NewListingValue1721726339472';

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
      `ALTER TABLE "listing" DROP COLUMN "apartmentInBuilding"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "roomsPerApartment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "bathsroomPerApartment"`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "address"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "area"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "bathrooms"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "totalArea"`);
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "numberOfRooms"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "areaPerApartment"`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "price"`);
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "numberOfStoreys"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "numberOfRentedApartments"`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "garageArea"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "deedNumber"`);
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing_attributes" ADD "value" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing_attributes" DROP CONSTRAINT "FK_f7c0de73fc225af6ae39cc67f95"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing_attributes" ALTER COLUMN "attributeId" SET NOT NULL`,
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
      `ALTER TABLE "listing_attributes" ADD CONSTRAINT "FK_f7c0de73fc225af6ae39cc67f95" FOREIGN KEY ("attributeId") REFERENCES "attribute"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing_attributes" DROP CONSTRAINT "FK_f7c0de73fc225af6ae39cc67f95"`,
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
      `ALTER TABLE "listing_attributes" ALTER COLUMN "attributeId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing_attributes" ADD CONSTRAINT "FK_f7c0de73fc225af6ae39cc67f95" FOREIGN KEY ("attributeId") REFERENCES "attribute"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing_attributes" DROP COLUMN "value"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "deedNumber" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "listing" ADD "garageArea" integer`);
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "numberOfRentedApartments" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "numberOfStoreys" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "price" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "areaPerApartment" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "numberOfRooms" integer`,
    );
    await queryRunner.query(`ALTER TABLE "listing" ADD "totalArea" integer`);
    await queryRunner.query(`ALTER TABLE "listing" ADD "bathrooms" integer`);
    await queryRunner.query(`ALTER TABLE "listing" ADD "area" integer`);
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "address" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "bathsroomPerApartment" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "roomsPerApartment" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "apartmentInBuilding" character varying`,
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
