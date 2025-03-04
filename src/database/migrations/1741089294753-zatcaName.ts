import { MigrationInterface, QueryRunner } from "typeorm";

export class ZatcaName1741089294753 implements MigrationInterface {
    name = 'ZatcaName1741089294753'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`);
        await queryRunner.query(`ALTER TABLE "finalization" DROP COLUMN "zatca"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "use"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "use" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "finalization" ADD "buyerZatca" character varying`);
        await queryRunner.query(`ALTER TABLE "finalization" ALTER COLUMN "sellerZatca" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "finalization" ALTER COLUMN "sellerIban" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "finalization" ALTER COLUMN "sellerBirthDate" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "finalization" ALTER COLUMN "ownershipAmmount" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "finalization" ALTER COLUMN "buyerIban" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "finalization" ALTER COLUMN "buyerBirthDate" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '"2025-03-04T11:54:58.097Z"'`);
        await queryRunner.query(`CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId") `);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`);
        await queryRunner.query(`ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '2025-03-03 09:10:38.093'`);
        await queryRunner.query(`ALTER TABLE "finalization" ALTER COLUMN "buyerBirthDate" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "finalization" ALTER COLUMN "buyerIban" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "finalization" ALTER COLUMN "ownershipAmmount" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "finalization" ALTER COLUMN "sellerBirthDate" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "finalization" ALTER COLUMN "sellerIban" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "finalization" ALTER COLUMN "sellerZatca" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "finalization" DROP COLUMN "buyerZatca"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "use"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "use" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "finalization" ADD "zatca" character varying NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId") `);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
