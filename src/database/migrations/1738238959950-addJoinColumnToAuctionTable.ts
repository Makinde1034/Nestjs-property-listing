import { MigrationInterface, QueryRunner } from "typeorm";

export class AddJoinColumnToAuctionTable1738238959950 implements MigrationInterface {
    name = 'AddJoinColumnToAuctionTable1738238959950'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "use"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "use" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '"2025-01-30T12:09:21.761Z"'`);
        await queryRunner.query(`ALTER TABLE "auction_participant" DROP CONSTRAINT "FK_1a16fa8aa29bcca8102420c1686"`);
        await queryRunner.query(`ALTER TABLE "auction_participant" DROP CONSTRAINT "FK_70ae7a8e218266318a7c5d149a4"`);
        await queryRunner.query(`ALTER TABLE "auction_participant" DROP CONSTRAINT "UQ_1a16fa8aa29bcca8102420c1686"`);
        await queryRunner.query(`ALTER TABLE "auction_participant" ALTER COLUMN "auctionId" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId") `);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auction_participant" ADD CONSTRAINT "FK_1a16fa8aa29bcca8102420c1686" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auction_participant" ADD CONSTRAINT "FK_70ae7a8e218266318a7c5d149a4" FOREIGN KEY ("auctionId") REFERENCES "auction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auction_participant" DROP CONSTRAINT "FK_70ae7a8e218266318a7c5d149a4"`);
        await queryRunner.query(`ALTER TABLE "auction_participant" DROP CONSTRAINT "FK_1a16fa8aa29bcca8102420c1686"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`);
        await queryRunner.query(`ALTER TABLE "auction_participant" ALTER COLUMN "auctionId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auction_participant" ADD CONSTRAINT "UQ_1a16fa8aa29bcca8102420c1686" UNIQUE ("listingId")`);
        await queryRunner.query(`ALTER TABLE "auction_participant" ADD CONSTRAINT "FK_70ae7a8e218266318a7c5d149a4" FOREIGN KEY ("auctionId") REFERENCES "auction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auction_participant" ADD CONSTRAINT "FK_1a16fa8aa29bcca8102420c1686" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '2025-01-30 11:37:06.534'`);
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
