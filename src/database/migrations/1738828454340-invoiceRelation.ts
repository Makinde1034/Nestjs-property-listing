import { MigrationInterface, QueryRunner } from "typeorm";

export class InvoiceRelation1738828454340 implements MigrationInterface {
    name = 'InvoiceRelation1738828454340'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "use"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "use" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "img" character varying`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_efaf8754718019a3f5531b9e7ee"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "UQ_efaf8754718019a3f5531b9e7ee"`);
        await queryRunner.query(`ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '"2025-02-06T07:54:18.118Z"'`);
        await queryRunner.query(`CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId") `);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_efaf8754718019a3f5531b9e7ee" FOREIGN KEY ("listingTypeId") REFERENCES "listing_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_efaf8754718019a3f5531b9e7ee"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`);
        await queryRunner.query(`ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '2025-01-31 13:54:38.003'`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "UQ_efaf8754718019a3f5531b9e7ee" UNIQUE ("listingTypeId")`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_efaf8754718019a3f5531b9e7ee" FOREIGN KEY ("listingTypeId") REFERENCES "listing_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "img"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "use"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "use" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`);
        await queryRunner.query(`CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId") `);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
