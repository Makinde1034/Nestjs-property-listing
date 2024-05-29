import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOwnerToListingTable1716983442842 implements MigrationInterface {
  name = 'AddOwnerToListingTable1716983442842';

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

    // Check if 'id' column exists
    const idColumnExists = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='role_permissions_permission' 
            AND column_name='id'
        `);

    if (idColumnExists.length === 0) {
      await queryRunner.query(
        `ALTER TABLE "role_permissions_permission" ADD COLUMN "id" SERIAL NOT NULL`,
      );
    }

    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "PK_1fcad95cc01b37848c6794bbdd8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_17022daf3f885f7d35423e9971e" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ALTER COLUMN "roleId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ALTER COLUMN "permissionId" DROP NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId") `,
    );

    // Check if 'approve' column exists
    const approveColumnExists = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='role_permissions_permission' 
            AND column_name='approve'
        `);

    if (approveColumnExists.length === 0) {
      await queryRunner.query(
        `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
      );
    }

    await queryRunner.query(
      `ALTER TABLE "listing" ADD "ownership" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "power_of_attorney" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "listing_type" character varying NOT NULL DEFAULT 'property'`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "country" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "listing" ADD "amenities" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "amenities"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "country"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "listing_type"`);
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "power_of_attorney"`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "ownership"`);

    // Check if 'approve' column exists before attempting to drop
    const approveColumnExists = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='role_permissions_permission' 
            AND column_name='approve'
        `);

    if (approveColumnExists.length > 0) {
      await queryRunner.query(
        `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
      );
    }

    await queryRunner.query(
      `DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`,
    );

    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`,
    );

    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "PK_17022daf3f885f7d35423e9971e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_1fcad95cc01b37848c6794bbdd8" PRIMARY KEY ("roleId", "permissionId")`,
    );

    // Check if 'id' column exists before attempting to drop
    const idColumnExists = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='role_permissions_permission' 
            AND column_name='id'
        `);

    if (idColumnExists.length > 0) {
      await queryRunner.query(
        `ALTER TABLE "role_permissions_permission" DROP COLUMN "id"`,
      );
    }

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
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
