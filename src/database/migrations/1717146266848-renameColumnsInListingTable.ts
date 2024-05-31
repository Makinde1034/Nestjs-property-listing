/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameColumnsInListingTable1717146266848
  implements MigrationInterface
{
  name = 'RenameColumnsInListingTable1717146266848';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check and drop foreign key constraints if they exist
    const foreignKeys = await queryRunner
      .getTable('role_permissions_permission')
      .then((table) => table.foreignKeys);
    const fk_b36cb2e04bc353ca4ede00d87b9 = foreignKeys.find(
      (fk) => fk.name === 'FK_b36cb2e04bc353ca4ede00d87b9',
    );
    const fk_bfbc9e263d4cea6d7a8c9eb3ad2 = foreignKeys.find(
      (fk) => fk.name === 'FK_bfbc9e263d4cea6d7a8c9eb3ad2',
    );

    if (fk_b36cb2e04bc353ca4ede00d87b9) {
      await queryRunner.query(
        `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`,
      );
    }
    if (fk_bfbc9e263d4cea6d7a8c9eb3ad2) {
      await queryRunner.query(
        `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`,
      );
    }

    // Check and drop indexes if they exist
    const indexes = await queryRunner
      .getTable('role_permissions_permission')
      .then((table) => table.indices);
    const idx_b36cb2e04bc353ca4ede00d87b = indexes.find(
      (idx) => idx.name === 'IDX_b36cb2e04bc353ca4ede00d87b',
    );
    const idx_bfbc9e263d4cea6d7a8c9eb3ad = indexes.find(
      (idx) => idx.name === 'IDX_bfbc9e263d4cea6d7a8c9eb3ad',
    );

    if (idx_b36cb2e04bc353ca4ede00d87b) {
      await queryRunner.query(
        `DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`,
      );
    }
    if (idx_bfbc9e263d4cea6d7a8c9eb3ad) {
      await queryRunner.query(
        `DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`,
      );
    }

    // Temporarily drop the primary key
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "PK_1fcad95cc01b37848c6794bbdd8"`,
    );

    // Drop the id column and re-add it with the SERIAL type
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "id" SERIAL NOT NULL`,
    );

    // Recreate the primary key with the new id column
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_1fcad95cc01b37848c6794bbdd8" PRIMARY KEY ("roleId", "permissionId", "id")`,
    );

    // Add the approve column if it does not exist
    const columns = await queryRunner
      .getTable('role_permissions_permission')
      .then((table) => table.columns);
    const approveColumn = columns.find((col) => col.name === 'approve');

    if (!approveColumn) {
      await queryRunner.query(
        `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
      );
    }

    // Recreate indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId")`,
    );

    // Recreate foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // Rename column in listing table
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "objectName"`);
    await queryRunner.query(`ALTER TABLE "listing" ADD "objectName" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert changes made in up migration

    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`,
    );
    // Drop indexes
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`,
    );

    // Temporarily drop the primary key
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "PK_1fcad95cc01b37848c6794bbdd8"`,
    );

    // Drop the approve column and the id column
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "id"`,
    );

    // Re-add the id column without the SERIAL type
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "id" SERIAL NOT NULL`,
    );

    // Recreate the primary key with the old structure
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_1fcad95cc01b37848c6794bbdd8" PRIMARY KEY ("roleId", "permissionId", "id")`,
    );

    // Recreate indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId")`,
    );

    // Recreate foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // Revert column rename in listing table
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "objectName"`);
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "objectName" character varying`,
    );
  }
}
