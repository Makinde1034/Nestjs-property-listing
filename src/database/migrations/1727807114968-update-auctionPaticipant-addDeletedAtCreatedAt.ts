/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAuctionPaticipantAddDeletedAtCreatedAt1727807114968
  implements MigrationInterface
{
  name = 'UpdateAuctionPaticipantAddDeletedAtCreatedAt1727807114968';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "use"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "use" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction_participant" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction_participant" ADD "deletedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction_participant" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-10-01T18:25:16.426Z"'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a148029e2181866d8a7fe13998" ON "general_ledger" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5a848d1cdeac4f186b82d252d9" ON "national_identity" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_056f7854a7afdba7cbd6d45fc2" ON "company" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_98bedc3257235969f6ff2ec668" ON "user_notification_preference" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2e4299a343a81574217255c00c" ON "review" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_57c6ae1abe49201919ef68de90" ON "offer" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e8100751be1076656606ae045e" ON "offer" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_632dd6a4052562ea81be6dc936" ON "token_confirmation" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_705b6c7cdf9b2c2ff7ac7872cb" ON "notification" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1ceacd881fec4bb75f74f2c7c5" ON "listing_type" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ad382c070e04f8eb07790fc036" ON "attribute_set" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0ddc56dc10fab70e627b3233b7" ON "listing_attributes" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b13fb7c5c9e9dff62b60e0de72" ON "attribute" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_18325f38ae6de43878487eff98" ON "messages" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9d0b2ba74336710fd31154738a" ON "chat" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d9a0835407701eb86f874474b7" ON "ticket" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_51954b1d32f5753bea3663d997" ON "parent_issue" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_51cb876613e02af5d97fd17cbb" ON "child_issue" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cd39e70214a4ef1c651a8dc604" ON "flag_listing" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_620bff4a240d66c357b5d820ea" ON "wishlist" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_705977a1f384d574ba83a7be47" ON "gps_coordinate" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_381d45ebb8692362c156d6b87d" ON "listing" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cb93c8f85dbdca85943ca49481" ON "search_history" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cace4a159ff9f2512dd4237376" ON "user" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_04950db3aaf3e3e795bcb11ada" ON "response_template" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3a2d5340468ff28c60bc65e105" ON "user_tracking" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_672dbafc4e8f17c0d7f86c6f82" ON "auction_participant" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9dc876c629273e71646cf6dfa6" ON "auction" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4235009780f5f21aca6636b80f" ON "admin_default" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4235009780f5f21aca6636b80f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9dc876c629273e71646cf6dfa6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_672dbafc4e8f17c0d7f86c6f82"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3a2d5340468ff28c60bc65e105"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_04950db3aaf3e3e795bcb11ada"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cace4a159ff9f2512dd4237376"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cb93c8f85dbdca85943ca49481"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_381d45ebb8692362c156d6b87d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_705977a1f384d574ba83a7be47"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_620bff4a240d66c357b5d820ea"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cd39e70214a4ef1c651a8dc604"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_51cb876613e02af5d97fd17cbb"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_51954b1d32f5753bea3663d997"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d9a0835407701eb86f874474b7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9d0b2ba74336710fd31154738a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_18325f38ae6de43878487eff98"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b13fb7c5c9e9dff62b60e0de72"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0ddc56dc10fab70e627b3233b7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ad382c070e04f8eb07790fc036"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1ceacd881fec4bb75f74f2c7c5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_705b6c7cdf9b2c2ff7ac7872cb"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_632dd6a4052562ea81be6dc936"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e8100751be1076656606ae045e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_57c6ae1abe49201919ef68de90"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2e4299a343a81574217255c00c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_98bedc3257235969f6ff2ec668"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_056f7854a7afdba7cbd6d45fc2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5a848d1cdeac4f186b82d252d9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a148029e2181866d8a7fe13998"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '2024-10-01 10:32:34.789'`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction_participant" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction_participant" DROP COLUMN "deletedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction_participant" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "use"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "use" boolean DEFAULT false`,
    );
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
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
