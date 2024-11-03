import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsActiveToProvideService1730662042972 implements MigrationInterface {
    name = 'AddIsActiveToProvideService1730662042972'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_status" DROP CONSTRAINT "FK_4a6cc79ec11cdfb2092aa526fed"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`);
        await queryRunner.query(`ALTER TABLE "service_status" DROP COLUMN "servicePrividerId"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "use"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "use" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "service_status" ADD "isActive" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-11-03T19:27:24.526Z"'`);
        await queryRunner.query(`ALTER TABLE "service_status" DROP COLUMN "serviceProviderId"`);
        await queryRunner.query(`ALTER TABLE "service_status" ADD "serviceProviderId" uuid NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId") `);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_status" ADD CONSTRAINT "FK_a9364c595ea78c1d16293317130" FOREIGN KEY ("serviceProviderId") REFERENCES "service_provider"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_status" DROP CONSTRAINT "FK_a9364c595ea78c1d16293317130"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`);
        await queryRunner.query(`ALTER TABLE "service_status" DROP COLUMN "serviceProviderId"`);
        await queryRunner.query(`ALTER TABLE "service_status" ADD "serviceProviderId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '2024-11-03 16:11:54.164'`);
        await queryRunner.query(`ALTER TABLE "service_status" DROP COLUMN "isActive"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "use"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "use" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "service_status" ADD "servicePrividerId" uuid`);
        await queryRunner.query(`CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId") `);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_status" ADD CONSTRAINT "FK_4a6cc79ec11cdfb2092aa526fed" FOREIGN KEY ("servicePrividerId") REFERENCES "service_provider"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
