import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOfferTable1717454723764 implements MigrationInterface {
  name = 'CreateOfferTable1717454723764';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create offer table
    await queryRunner.query(`
            CREATE TABLE "offer" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "offerPrice" money NOT NULL, 
                "expireAt" TIMESTAMP NOT NULL, 
                "acceptedAt" TIMESTAMP, 
                "status" character varying NOT NULL DEFAULT 'pending', 
                "coupon" boolean NOT NULL DEFAULT false, 
                "couponCode" character varying, 
                "userId" uuid NOT NULL, 
                "listingId" uuid NOT NULL, 
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
                "deletedAt" TIMESTAMP, 
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_57c6ae1abe49201919ef68de900" PRIMARY KEY ("id")
            )
        `);

    // Drop existing constraints if they exist
    const constraints = await queryRunner.query(`
            SELECT conname as constraint_name
            FROM pg_constraint
            WHERE conrelid = 'role_permissions_permission'::regclass
        `);

    for (const constraint of constraints) {
      await queryRunner.query(
        `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT IF EXISTS "${constraint.constraint_name}"`,
      );
    }

    // Alter table: role_permissions_permission
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

    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ALTER COLUMN "roleId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ALTER COLUMN "permissionId" DROP NOT NULL`,
    );

    // Add new primary key constraint
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_1fcad95cc01b37848c6794bbdd8" PRIMARY KEY ("id")`,
    );

    // Check if indexes exist before creating
    const existingIndexes = await queryRunner.query(`
            SELECT indexname
            FROM pg_indexes
            WHERE tablename = 'role_permissions_permission'
        `);

    const indexNames = existingIndexes.map(
      (index: { indexname: string }) => index.indexname,
    );

    if (!indexNames.includes('IDX_b36cb2e04bc353ca4ede00d87b')) {
      await queryRunner.query(
        `CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId")`,
      );
    }

    if (!indexNames.includes('IDX_bfbc9e263d4cea6d7a8c9eb3ad')) {
      await queryRunner.query(
        `CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId")`,
      );
    }

    // Re-add foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // Add foreign keys to offer table
    await queryRunner.query(
      `ALTER TABLE "offer" ADD CONSTRAINT "FK_e8100751be1076656606ae045e3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer" ADD CONSTRAINT "FK_dadbc0be2373193231f00156950" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop offer table constraints
    await queryRunner.query(
      `ALTER TABLE "offer" DROP CONSTRAINT "FK_dadbc0be2373193231f00156950"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer" DROP CONSTRAINT "FK_e8100751be1076656606ae045e3"`,
    );
    await queryRunner.query(`DROP TABLE "offer"`);

    // Drop role_permissions_permission constraints if they exist
    const constraints = await queryRunner.query(`
            SELECT conname as constraint_name
            FROM pg_constraint
            WHERE conrelid = 'role_permissions_permission'::regclass
        `);

    for (const constraint of constraints) {
      await queryRunner.query(
        `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT IF EXISTS "${constraint.constraint_name}"`,
      );
    }

    // Revert changes to role_permissions_permission table
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN IF EXISTS "approve"`,
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

    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ALTER COLUMN "roleId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ALTER COLUMN "permissionId" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_1fcad95cc01b37848c6794bbdd8" PRIMARY KEY ("roleId", "permissionId", "id")`,
    );

    // Re-create indexes
    const existingIndexes = await queryRunner.query(`
            SELECT indexname
            FROM pg_indexes
            WHERE tablename = 'role_permissions_permission'
        `);

    const indexNames = existingIndexes.map(
      (index: { indexname: string }) => index.indexname,
    );

    if (!indexNames.includes('IDX_b36cb2e04bc353ca4ede00d87b')) {
      await queryRunner.query(
        `CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId")`,
      );
    }

    if (!indexNames.includes('IDX_bfbc9e263d4cea6d7a8c9eb3ad')) {
      await queryRunner.query(
        `CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId")`,
      );
    }

    // Re-add foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
