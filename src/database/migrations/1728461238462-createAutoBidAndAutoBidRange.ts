/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAutoBidAndAutoBidRange1728461238462
  implements MigrationInterface
{
  name = 'CreateAutoBidAndAutoBidRange1728461238462';

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
      `CREATE TABLE "auto_bid" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "listingId" character varying NOT NULL, "auctionId" character varying NOT NULL, "userId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d5f6e460c5650518be834f7525a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d5f6e460c5650518be834f7525" ON "auto_bid" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "auction_bid_range" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "lowerBound" integer NOT NULL, "upperBound" integer NOT NULL, "increment" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_512acd94092172970181c8cfaf2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_512acd94092172970181c8cfaf" ON "auction_bid_range" ("id") `,
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
      `ALTER TABLE "user" ADD "autoBidEnable" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ALTER COLUMN "slug" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ALTER COLUMN "category" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ALTER COLUMN "approveFlag" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ALTER COLUMN "useFlag" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ALTER COLUMN "useFlag" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ALTER COLUMN "staffAccess" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ALTER COLUMN "staffAccess" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ALTER COLUMN "individualAccess" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ALTER COLUMN "companyAccess" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-10-09T08:07:20.221Z"'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_89b0129dcb346cd9be42a6bbbf" ON "ticket" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0009eb5885e2b0e39ef9f1d7f8" ON "ticket" ("closedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_31e550af60e905e57eb5c0df43" ON "ticket" ("createdAt") `,
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
      `DROP INDEX "public"."IDX_31e550af60e905e57eb5c0df43"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0009eb5885e2b0e39ef9f1d7f8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_89b0129dcb346cd9be42a6bbbf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '2024-10-03 14:44:06.496'`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ALTER COLUMN "companyAccess" SET DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ALTER COLUMN "individualAccess" SET DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ALTER COLUMN "staffAccess" SET DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ALTER COLUMN "staffAccess" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ALTER COLUMN "useFlag" SET DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ALTER COLUMN "useFlag" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ALTER COLUMN "approveFlag" SET DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ALTER COLUMN "category" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ALTER COLUMN "slug" DROP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "autoBidEnable"`);
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
      `DROP INDEX "public"."IDX_512acd94092172970181c8cfaf"`,
    );
    await queryRunner.query(`DROP TABLE "auction_bid_range"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d5f6e460c5650518be834f7525"`,
    );
    await queryRunner.query(`DROP TABLE "auto_bid"`);
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
