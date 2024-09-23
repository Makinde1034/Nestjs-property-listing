/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameColumnsInListingTable1717147494823
  implements MigrationInterface
{
  name = 'RenameColumnsInListingTable1717147494823';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Dropping existing constraints and indexes
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT IF EXISTS "FK_b36cb2e04bc353ca4ede00d87b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT IF EXISTS "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_b36cb2e04bc353ca4ede00d87b"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`,
    );

    // Dropping the 'approve' column if it exists
    const approveColumnExists = await queryRunner.hasColumn(
      'role_permissions_permission',
      'approve',
    );
    if (approveColumnExists) {
      await queryRunner.query(
        `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
      );
    }

    // Dropping primary key constraint
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "PK_1fcad95cc01b37848c6794bbdd8"`,
    );

    // Check if 'id' column exists before adding it
    const idColumnExists = await queryRunner.hasColumn(
      'role_permissions_permission',
      'id',
    );
    if (!idColumnExists) {
      await queryRunner.query(
        `ALTER TABLE "role_permissions_permission" ADD "id" SERIAL PRIMARY KEY`,
      );
    }

    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );

    // Allow NULLs in 'roleId' and 'permissionId' by dropping NOT NULL constraint
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ALTER COLUMN "roleId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ALTER COLUMN "permissionId" DROP NOT NULL`,
    );

    // Adding new columns in the 'listing' table
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "name" character varying`,
    );

    // Recreating indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId")`,
    );

    // Recreating foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Dropping foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`,
    );

    // Dropping indexes
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`,
    );

    // Dropping primary key constraint
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "role_permissions_permission_pkey"`,
    );

    // Dropping columns added during 'up' migration
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
    );

    // Adding 'id' column and setting it as primary key along with 'roleId' and 'permissionId'
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "id" SERIAL`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_1fcad95cc01b37848c6794bbdd8" PRIMARY KEY ("roleId", "permissionId", "id")`,
    );

    // Adding 'approve' column
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );

    // Removing 'name' column from 'listing' table
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "name"`);

    // Recreating indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId")`,
    );

    // Recreating foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
