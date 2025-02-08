import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexes1738946953940 implements MigrationInterface {
    name = 'AddIndexes1738946953940'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "use"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "use" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "ticket" ADD "ticketNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '"2025-02-07T16:49:15.945Z"'`);
        await queryRunner.query(`CREATE INDEX "IDX_1a16fa8aa29bcca8102420c168" ON "auction_participant" ("listingId") `);
        await queryRunner.query(`CREATE INDEX "IDX_70ae7a8e218266318a7c5d149a" ON "auction_participant" ("auctionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_7281b56655d2bbec6a500bd459" ON "auction" ("startDate") `);
        await queryRunner.query(`CREATE INDEX "IDX_b6c65c4d8ee998a146831d47f9" ON "auction" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_23a24af12771c5b1dd567b83e9" ON "auction" ("expireAt") `);
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
        await queryRunner.query(`DROP INDEX "public"."IDX_23a24af12771c5b1dd567b83e9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b6c65c4d8ee998a146831d47f9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7281b56655d2bbec6a500bd459"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_70ae7a8e218266318a7c5d149a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1a16fa8aa29bcca8102420c168"`);
        await queryRunner.query(`ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '2025-02-06 07:54:18.118'`);
        await queryRunner.query(`ALTER TABLE "ticket" DROP COLUMN "ticketNumber"`);
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
