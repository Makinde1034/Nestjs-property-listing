/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateListingTable1717509072980 implements MigrationInterface {
  name = 'UpdateListingTable1717509072980';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT IF EXISTS "FK_b36cb2e04bc353ca4ede00d87b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT IF EXISTS "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`,
    );

    // Drop indices
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_b36cb2e04bc353ca4ede00d87b"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`,
    );

    // Drop primary key constraint
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT IF EXISTS "PK_1fcad95cc01b37848c6794bbdd8"`,
    );

    // Ensure the id column exists
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL`,
    );

    // Add the primary key constraint
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_17022daf3f885f7d35423e9971e" PRIMARY KEY ("id")`,
    );

    // Drop approve column and re-add it with default value
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN IF EXISTS "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD COLUMN IF NOT EXISTS "approve" boolean DEFAULT false`,
    );

    // Make roleId and permissionId columns nullable
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ALTER COLUMN "roleId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ALTER COLUMN "permissionId" DROP NOT NULL`,
    );

    // Recreate indices
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId")`,
    );

    // Add foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // Drop and re-add userId foreign key constraint on listing table, and make userId nullable
    await queryRunner.query(
      `ALTER TABLE "listing" DROP CONSTRAINT IF EXISTS "FK_33bd8a3b7eeccb95ae45038d956"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "userId" DROP NOT NULL`,
    );

    // Check if the foreign key constraint already exists
    const userIdConstraintExists = await queryRunner.query(`
            SELECT 1
            FROM pg_constraint
            WHERE conname = 'FK_33bd8a3b7eeccb95ae45038d956'
        `);
    if (!userIdConstraintExists.length) {
      await queryRunner.query(
        `ALTER TABLE "listing" ADD CONSTRAINT "FK_33bd8a3b7eeccb95ae45038d956" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse changes on listing table
    await queryRunner.query(
      `ALTER TABLE "listing" DROP CONSTRAINT IF EXISTS "FK_33bd8a3b7eeccb95ae45038d956"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "userId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD CONSTRAINT "FK_33bd8a3b7eeccb95ae45038d956" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT IF EXISTS "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT IF EXISTS "FK_b36cb2e04bc353ca4ede00d87b9"`,
    );

    // Drop indices
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_b36cb2e04bc353ca4ede00d87b"`,
    );

    // Drop primary key constraint
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "PK_17022daf3f885f7d35423e9971e"`,
    );

    // Remove id column
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN IF EXISTS "id"`,
    );

    // Re-add approve column
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD COLUMN "approve" boolean DEFAULT false`,
    );

    // Set primary key back to roleId, permissionId, and id
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_1fcad95cc01b37848c6794bbdd8" PRIMARY KEY ("roleId", "permissionId", "id")`,
    );

    // Make roleId and permissionId not nullable again
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ALTER COLUMN "roleId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ALTER COLUMN "permissionId" SET NOT NULL`,
    );

    // Recreate indices
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId")`,
    );

    // Re-add foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
