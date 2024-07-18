/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class NewListingTable1721306635840 implements MigrationInterface {
  name = 'NewListingTable1721306635840';

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
      `CREATE TABLE "listing_attributes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "listingId" uuid NOT NULL, CONSTRAINT "PK_0ddc56dc10fab70e627b3233b71" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "gpsCoordinates"`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "negotiatable"`);
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
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "isDisabled"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "garageArea"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "isListing"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "maidsRoom"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "petsAllowed"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "amenities"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "sellingType"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "listingType"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "districtCity"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "propertySize"`);
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "publicationDate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "numberOfStoreys"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "numberOfApartment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "rentedApartment"`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "garageSize"`);
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "numberOfBathrooms"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "numberOfRooms"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "areaOfApartment"`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "totalArea"`);
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "iban" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "zatcaNumber" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "listingTypeId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "address" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "apartmentNumber" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "villaAndFarmNumber" integer`,
    );
    await queryRunner.query(`ALTER TABLE "listing" ADD "gpsCoordinate" jsonb`);
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "isListingFeatured" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "isListingDisabled" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "negotiable" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "attribute" ALTER COLUMN "englishName" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "attribute" DROP COLUMN "isAmenities"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attribute" ADD "isAmenities" boolean`,
    );
    await queryRunner.query(`ALTER TABLE "search_history" DROP COLUMN "price"`);
    await queryRunner.query(
      `ALTER TABLE "search_history" ADD "price" integer NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "price"`);
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "price" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "street" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "district" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "floor"`);
    await queryRunner.query(`ALTER TABLE "listing" ADD "floor" integer`);
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "buildingNumber"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "buildingNumber" integer`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "landArea"`);
    await queryRunner.query(`ALTER TABLE "listing" ADD "landArea" integer`);
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
      `ALTER TABLE "listing_attributes" ADD CONSTRAINT "FK_2c3503e6ed6c50af820d3f938df" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD CONSTRAINT "FK_abcc9d10f8b8f00819eab3aaa20" FOREIGN KEY ("listingTypeId") REFERENCES "listing_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" DROP CONSTRAINT "FK_abcc9d10f8b8f00819eab3aaa20"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing_attributes" DROP CONSTRAINT "FK_2c3503e6ed6c50af820d3f938df"`,
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
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "landArea"`);
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "landArea" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "buildingNumber"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "buildingNumber" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "floor"`);
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "floor" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "district" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "street" DROP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "price"`);
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "price" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "search_history" DROP COLUMN "price"`);
    await queryRunner.query(
      `ALTER TABLE "search_history" ADD "price" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "attribute" DROP COLUMN "isAmenities"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attribute" ADD "isAmenities" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "attribute" ALTER COLUMN "englishName" DROP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "negotiable"`);
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "isListingDisabled"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "isListingFeatured"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "gpsCoordinate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "villaAndFarmNumber"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "apartmentNumber"`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "address"`);
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "listingTypeId"`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "zatcaNumber"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "iban"`);
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "totalArea" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "areaOfApartment" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "numberOfRooms" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "numberOfBathrooms" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "garageSize" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "rentedApartment" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "numberOfApartment" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "numberOfStoreys" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "publicationDate" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "propertySize" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "districtCity" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "listingType" character varying NOT NULL DEFAULT 'property'`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "sellingType" character varying NOT NULL DEFAULT 'rent'`,
    );
    await queryRunner.query(`ALTER TABLE "listing" ADD "amenities" text`);
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "petsAllowed" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "maidsRoom" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "isListing" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "garageArea" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "isDisabled" boolean NOT NULL DEFAULT false`,
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
      `ALTER TABLE "listing" ADD "negotiatable" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "listing" ADD "gpsCoordinates" jsonb`);
    await queryRunner.query(`DROP TABLE "listing_attributes"`);
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
