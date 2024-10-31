import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateRelatonOfBidandAuctionParticipant1730394317841 implements MigrationInterface {
    name = 'UpdateRelatonOfBidandAuctionParticipant1730394317841'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auction_participant" DROP CONSTRAINT "FK_8fc4fa0b1eb42640f79fb1b36c4"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`);
        await queryRunner.query(`ALTER TABLE "auction_participant" DROP COLUMN "bidId"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "use"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "use" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-10-31T17:05:19.320Z"'`);
        await queryRunner.query(`ALTER TABLE "bids" DROP CONSTRAINT "FK_fc2de2eb9789ba071e3806d8562"`);
        await queryRunner.query(`ALTER TABLE "bids" DROP CONSTRAINT "UQ_fc2de2eb9789ba071e3806d8562"`);
        await queryRunner.query(`CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId") `);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bids" ADD CONSTRAINT "FK_fc2de2eb9789ba071e3806d8562" FOREIGN KEY ("auctionParticipantId") REFERENCES "auction_participant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bids" DROP CONSTRAINT "FK_fc2de2eb9789ba071e3806d8562"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`);
        await queryRunner.query(`ALTER TABLE "bids" ADD CONSTRAINT "UQ_fc2de2eb9789ba071e3806d8562" UNIQUE ("auctionParticipantId")`);
        await queryRunner.query(`ALTER TABLE "bids" ADD CONSTRAINT "FK_fc2de2eb9789ba071e3806d8562" FOREIGN KEY ("auctionParticipantId") REFERENCES "auction_participant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '2024-10-31 16:09:27.034'`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "use"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "use" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "auction_participant" ADD "bidId" uuid`);
        await queryRunner.query(`CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId") `);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auction_participant" ADD CONSTRAINT "FK_8fc4fa0b1eb42640f79fb1b36c4" FOREIGN KEY ("bidId") REFERENCES "bids"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
