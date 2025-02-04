import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexinToActivityLogRelation1738331676274 implements MigrationInterface {
    name = 'AddIndexinToActivityLogRelation1738331676274'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "use"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "use" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '"2025-01-31T13:54:38.003Z"'`);
        await queryRunner.query(`CREATE INDEX "IDX_d19abacc8a508c0429478ad166" ON "activity_log" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3d1a44ff0e61fef285295c3e5f" ON "activity_log" ("adminId") `);
        await queryRunner.query(`CREATE INDEX "IDX_584561a2ef7388a60b2da6dc94" ON "activity_log" ("roleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_db83e3c5b6fd7d08c133400f43" ON "activity_log" ("listingTypeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_6e20dbf1d4b30f3096aecfc43d" ON "activity_log" ("listingId") `);
        await queryRunner.query(`CREATE INDEX "IDX_2e71d075f763f61961b6818661" ON "activity_log" ("responseTemplateId") `);
        await queryRunner.query(`CREATE INDEX "IDX_de66c3ae2be1326ff507b01480" ON "activity_log" ("ticketId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e98e158bbd4c9251f28d6a4396" ON "activity_log" ("articleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_dc8d83229bf9130441dde2b375" ON "activity_log" ("serviceProviderId") `);
        await queryRunner.query(`CREATE INDEX "IDX_0fa3a610ed1a92ffd06e5e16f6" ON "activity_log" ("splashScreenId") `);
        await queryRunner.query(`CREATE INDEX "IDX_cf10d23c53d7f244fe4028962a" ON "activity_log" ("auctionId") `);
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
        await queryRunner.query(`DROP INDEX "public"."IDX_cf10d23c53d7f244fe4028962a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0fa3a610ed1a92ffd06e5e16f6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dc8d83229bf9130441dde2b375"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e98e158bbd4c9251f28d6a4396"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_de66c3ae2be1326ff507b01480"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2e71d075f763f61961b6818661"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6e20dbf1d4b30f3096aecfc43d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_db83e3c5b6fd7d08c133400f43"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_584561a2ef7388a60b2da6dc94"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3d1a44ff0e61fef285295c3e5f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d19abacc8a508c0429478ad166"`);
        await queryRunner.query(`ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '2025-01-30 17:19:29.105'`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "use"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "use" boolean DEFAULT false`);
        await queryRunner.query(`CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId") `);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
