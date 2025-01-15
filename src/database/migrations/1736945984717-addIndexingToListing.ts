import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexingToListing1736945984717 implements MigrationInterface {
    name = 'AddIndexingToListing1736945984717'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`);
        await queryRunner.query(`CREATE TABLE "finalization" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sellerZatca" character varying NOT NULL, "sellerIban" character varying NOT NULL, "sellerBirthDate" character varying NOT NULL, "ownershipAmmount" integer NOT NULL, "zatca" character varying NOT NULL, "buyerIban" character varying NOT NULL, "buyerBirthDate" character varying NOT NULL, "offerId" uuid NOT NULL, CONSTRAINT "REL_dd0ac28f36409e39035894000f" UNIQUE ("offerId"), CONSTRAINT "PK_210e044637a47a52acc6d0e9c75" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_210e044637a47a52acc6d0e9c7" ON "finalization" ("id") `);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "use"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "use" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '"2025-01-15T12:59:46.428Z"'`);
        await queryRunner.query(`CREATE INDEX "IDX_1913ae838fbf31928ae3bd0355" ON "gps_coordinate" ("lat") `);
        await queryRunner.query(`CREATE INDEX "IDX_2e651ada32367c18b29bd5420f" ON "gps_coordinate" ("lng") `);
        await queryRunner.query(`CREATE INDEX "IDX_d3a15d9a574e2f73da2479d7d3" ON "place" ("placeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_22ff572994ddd7d238d74301de" ON "place" ("type") `);
        await queryRunner.query(`CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId") `);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "finalization" ADD CONSTRAINT "FK_dd0ac28f36409e39035894000f7" FOREIGN KEY ("offerId") REFERENCES "offer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "finalization" DROP CONSTRAINT "FK_dd0ac28f36409e39035894000f7"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_22ff572994ddd7d238d74301de"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d3a15d9a574e2f73da2479d7d3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2e651ada32367c18b29bd5420f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1913ae838fbf31928ae3bd0355"`);
        await queryRunner.query(`ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '2025-01-07 22:55:49.617'`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "use"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "use" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`);
        await queryRunner.query(`DROP INDEX "public"."IDX_210e044637a47a52acc6d0e9c7"`);
        await queryRunner.query(`DROP TABLE "finalization"`);
        await queryRunner.query(`CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId") `);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
