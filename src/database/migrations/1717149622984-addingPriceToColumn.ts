/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddingPriceToColumn1717149622984 implements MigrationInterface {
  name = 'AddingPriceToColumn1717149622984';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
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

    // Rename column in listing table
    await queryRunner.query(
      `ALTER TABLE "listing" RENAME COLUMN "numberOfRooms" TO "price"`,
    );

    // Modify role_permissions_permission table
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
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_17022daf3f885f7d35423e9971e" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );

    // Ensure roleId and permissionId are not null
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ALTER COLUMN "roleId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ALTER COLUMN "permissionId" SET NOT NULL`,
    );

    // Modify primary keys and constraints
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT IF EXISTS "PK_17022daf3f885f7d35423e9971e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_1fcad95cc01b37848c6794bbdd8" PRIMARY KEY ("roleId", "permissionId", "id")`,
    );

    // Recreate indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId")`,
    );

    // Recreate foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT IF EXISTS "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT IF EXISTS "FK_b36cb2e04bc353ca4ede00d87b9"`,
    );

    // Drop indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_b36cb2e04bc353ca4ede00d87b"`,
    );

    // Modify primary keys and constraints
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT IF EXISTS "PK_1fcad95cc01b37848c6794bbdd8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_42d6ade159e994924085de23d1a" PRIMARY KEY ("roleId", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ALTER COLUMN "permissionId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT IF EXISTS "PK_42d6ade159e994924085de23d1a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_17022daf3f885f7d35423e9971e" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ALTER COLUMN "roleId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT IF EXISTS "PK_17022daf3f885f7d35423e9971e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_0a2ca94358c371e4ba5ffdb7b34" PRIMARY KEY ("permissionId", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT IF EXISTS "PK_0a2ca94358c371e4ba5ffdb7b34"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_1fcad95cc01b37848c6794bbdd8" PRIMARY KEY ("roleId", "permissionId", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT IF EXISTS "PK_b817d7eca3b85f22130861259dd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_17022daf3f885f7d35423e9971e" PRIMARY KEY ("id")`,
    );

    // Drop and recreate columns
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN IF EXISTS "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT IF EXISTS "PK_17022daf3f885f7d35423e9971e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN IF EXISTS "id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "id" SERIAL NOT NULL`,
    );

    // Rename column in listing table back to original
    await queryRunner.query(
      `ALTER TABLE "listing" RENAME COLUMN "price" TO "numberOfRooms"`,
    );

    // Recreate indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId")`,
    );

    // Recreate foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
