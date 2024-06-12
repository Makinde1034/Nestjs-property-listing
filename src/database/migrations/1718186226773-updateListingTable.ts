/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateListingTable1718186226773 implements MigrationInterface {
  name = 'UpdateListingTable1718186226773';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "property_number"`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "city"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "purpose"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "coordinates"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "land_area"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "garage"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "pool"`);
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "outdoorKitchen"`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "garden"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "guestHouse"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "tennisCourt"`);
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "basketballCourt"`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "jacuzzi"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "bbqArea"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "maidsRoom"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "petsAllowed"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "balcony"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "gym"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "playground"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "parking"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "security"`);
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "airConditioning"`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "storageRoom"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "laundryRoom"`);
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "conferenceRoom"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "gatedCommunity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "indoorPlayArea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "coveredParking"`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "wifi"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "elevator"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "deednumber"`);
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "rentedApartments"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "propertyNumber" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "deedNumber" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "districtCity" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "listing" ADD "amenities" text`);
    await queryRunner.query(`ALTER TABLE "listing" ADD "gpsCoordinates" jsonb`);
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "landArea" character varying`,
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
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "landArea"`);
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "gpsCoordinates"`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "amenities"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "districtCity"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "deedNumber"`);
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "propertyNumber"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "rentedApartments" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "deednumber" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "elevator" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "wifi" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "coveredParking" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "indoorPlayArea" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "gatedCommunity" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "conferenceRoom" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "laundryRoom" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "storageRoom" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "airConditioning" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "security" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "parking" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "playground" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "gym" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "balcony" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "petsAllowed" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "maidsRoom" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "bbqArea" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "jacuzzi" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "basketballCourt" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "tennisCourt" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "guestHouse" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "garden" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "outdoorKitchen" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "pool" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "garage" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "land_area" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "listing" ADD "coordinates" jsonb`);
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "purpose" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "city" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "property_number" character varying NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
