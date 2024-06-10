/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateListingTable1717762231396 implements MigrationInterface {
  name = 'UpdateListingTable1717762231396';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Drop existing primary key constraint if exists
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT IF EXISTS "PK_1fcad95cc01b37848c6794bbdd8"`,
    );

    // Step 2: Add new primary key constraint without "roleId"
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_bfbc9e263d4cea6d7a8c9eb3ad" PRIMARY KEY ("permissionId", "id")`,
    );

    // Step 3: Drop NOT NULL constraint from "roleId"
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ALTER COLUMN "roleId" DROP NOT NULL`,
    );

    // Continue with other column modifications
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "mediaType"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "objectName"`);

    // Step 4: Further modifications on primary key (depends on your needs)
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT IF EXISTS "PK_bfbc9e263d4cea6d7a8c9eb3ad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_1fcad95cc01b37848c6794bbdd8" PRIMARY KEY ("roleId", "permissionId")`,
    );

    // Other necessary modifications
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN IF EXISTS "id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN IF EXISTS "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "id" SERIAL NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );

    // Update the listing table with new columns
    await queryRunner.query(`ALTER TABLE "listing" ADD "images" jsonb`);
    await queryRunner.query(`ALTER TABLE "listing" ADD "videos" jsonb`);
    await queryRunner.query(`ALTER TABLE "listing" ADD "gpsCoordinates" jsonb`);
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "district" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "street" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "building" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "floor" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "landArea" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "numberOfAppartment" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "numberOfStoreys" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "areaOfAppartment" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "garageArea" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "totalArea" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "numberOFRentedAppartment" character varying`,
    );

    // Step 5: Drop existing indexes if they exist
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_b36cb2e04bc353ca4ede00d87b"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_bfbc9e263d4cea6d7a8c9eb3ad"`,
    );

    // Step 6: Re-create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId")`,
    );

    // Step 7: Conditionally add foreign key constraints back
    await queryRunner.query(`
            DO $$ BEGIN
                ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"
                    FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
            EXCEPTION WHEN others THEN
                IF SQLSTATE = '42710' THEN
                    -- Constraint already exists
                ELSE
                    RAISE;
                END IF;
            END $$;
        `);

    await queryRunner.query(`
            DO $$ BEGIN
                ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"
                    FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
            EXCEPTION WHEN others THEN
                IF SQLSTATE = '42710' THEN
                    -- Constraint already exists
                ELSE
                    RAISE;
                END IF;
            END $$;
        `);

    await queryRunner.query(`
            DO $$ BEGIN
                ALTER TABLE "listing" ADD CONSTRAINT "FK_33bd8a3b7eeccb95ae45038d956"
                    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
            EXCEPTION WHEN others THEN
                IF SQLSTATE = '42710' THEN
                    -- Constraint already exists
                ELSE
                    RAISE;
                END IF;
            END $$;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse the changes made in the up method
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
      `DROP INDEX IF EXISTS "IDX_bfbc9e263d4cea6d7a8c9eb3ad"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_b36cb2e04bc353ca4ede00d87b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "PK_1fcad95cc01b37848c6794bbdd8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_bfbc9e263d4cea6d7a8c9eb3ad" PRIMARY KEY ("permissionId", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ALTER COLUMN "roleId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "PK_bfbc9e263d4cea6d7a8c9eb3ad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_1fcad95cc01b37848c6794bbdd8" PRIMARY KEY ("roleId", "permissionId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "id" SERIAL NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD CONSTRAINT "FK_33bd8a3b7eeccb95ae45038d956" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
