/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameColumnsInListingTable1717139435987
  implements MigrationInterface
{
  name = 'RenameColumnsInListingTable1717139435987';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "listing" DROP CONSTRAINT IF EXISTS "FK_1d0a76cdbe48c877ddb9f8c648d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT IF EXISTS "FK_b36cb2e04bc353ca4ede00d87b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT IF EXISTS "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`,
    );

    // Drop indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_b36cb2e04bc353ca4ede00d87b"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`,
    );

    // Drop columns in the listing table
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN IF EXISTS "selling_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN IF EXISTS "renting_option"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN IF EXISTS "property_number"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN IF EXISTS "deed_number"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN IF EXISTS "district_city"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN IF EXISTS "property_size"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN IF EXISTS "publication_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN IF EXISTS "number_of_rooms"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN IF EXISTS "number_of_bathrooms"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN IF EXISTS "number_of_bedrooms"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN IF EXISTS "media_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN IF EXISTS "object_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN IF EXISTS "user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN IF EXISTS "power_of_attorney"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN IF EXISTS "listing_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN IF EXISTS "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN IF EXISTS "updated_at"`,
    );

    // Drop primary key constraint if exists
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT IF EXISTS "PK_1fcad95cc01b37848c6794bbdd8"`,
    );

    // Drop id and approve columns in role_permissions_permission
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN IF EXISTS "id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN IF EXISTS "approve"`,
    );

    // Add new id column and primary key constraint
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "id" SERIAL NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_17022daf3f885f7d35423e9971e" PRIMARY KEY ("id")`,
    );

    // Add approve column
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );

    // Add new columns to listing table
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "sellingType" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "powerOfAttorney" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "listingType" character varying NOT NULL DEFAULT 'property'`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "rentingOption" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "propertyNumber" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "deedNumber" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "districtCity" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "propertySize" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "publicationDate" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "numberOfRooms" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "numberOfBathrooms" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "numberOfBedrooms" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "mediaType" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "objectName" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "listing" ADD "userId" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );

    // Re-create primary key constraint with multiple columns
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT IF EXISTS "PK_17022daf3f885f7d35423e9971e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_1fcad95cc01b37848c6794bbdd8" PRIMARY KEY ("roleId", "permissionId", "id")`,
    );

    // Recreate indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId") `,
    );

    // Add foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD CONSTRAINT "FK_33bd8a3b7eeccb95ae45038d956" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" DROP CONSTRAINT "FK_33bd8a3b7eeccb95ae45038d956"`,
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
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "PK_1fcad95cc01b37848c6794bbdd8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_17022daf3f885f7d35423e9971e" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "objectName"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "mediaType"`);
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "numberOfBedrooms"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "numberOfBathrooms"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "numberOfRooms"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "publicationDate"`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "propertySize"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "districtCity"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "deedNumber"`);
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "propertyNumber"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "rentingOption"`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "listingType"`);
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "powerOfAttorney"`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "sellingType"`);
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_1fcad95cc01b37848c6794bbdd8" PRIMARY KEY ("roleId", "permissionId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "id" SERIAL NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "listing_type" character varying NOT NULL DEFAULT 'property'`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "power_of_attorney" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "user_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "object_name" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "media_type" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "number_of_bedrooms" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "number_of_bathrooms" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "number_of_rooms" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "publication_date" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "property_size" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "district_city" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "deed_number" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "property_number" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "renting_option" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "selling_type" character varying NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD CONSTRAINT "FK_1d0a76cdbe48c877ddb9f8c648d" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
