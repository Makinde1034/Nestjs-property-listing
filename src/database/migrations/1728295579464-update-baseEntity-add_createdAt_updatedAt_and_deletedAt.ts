/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateBaseEntityAddCreatedAtUpdatedAtAndDeletedAt1728295579464
  implements MigrationInterface
{
  name = 'UpdateBaseEntityAddCreatedAtUpdatedAtAndDeletedAt1728295579464';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
      `CREATE TABLE "auto_bid" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT '"2024-10-07T10:06:20.892Z"', CONSTRAINT "PK_d5f6e460c5650518be834f7525a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d5f6e460c5650518be834f7525" ON "auto_bid" ("id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "attribute_set" DROP COLUMN "deletedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "use"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "national_identity" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "national_identity" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT '"2024-10-07T10:06:20.892Z"'`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "use" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "company" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "company" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT '"2024-10-07T10:06:20.892Z"'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_preference" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_preference" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT '"2024-10-07T10:06:20.892Z"'`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing_attributes" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing_attributes" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT '"2024-10-07T10:06:20.892Z"'`,
    );
    await queryRunner.query(
      `ALTER TABLE "gps_coordinate" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "gps_coordinate" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT '"2024-10-07T10:06:20.892Z"'`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-10-07T10:06:20.892Z"'`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-10-07T10:06:20.892Z"'`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer" ALTER COLUMN "deletedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_history" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-10-07T10:06:20.892Z"'`,
    );
    await queryRunner.query(
      `ALTER TABLE "flag_listing" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-10-07T10:06:20.892Z"'`,
    );
    await queryRunner.query(
      `ALTER TABLE "child_issue" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-10-07T10:06:20.892Z"'`,
    );
    await queryRunner.query(
      `ALTER TABLE "token_confirmation" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-10-07T10:06:20.892Z"'`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-10-07T10:06:20.892Z"'`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing_type" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-10-07T10:06:20.892Z"'`,
    );
    await queryRunner.query(
      `ALTER TABLE "attribute_set" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-10-07T10:06:20.892Z"'`,
    );
    await queryRunner.query(
      `ALTER TABLE "attribute" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-10-07T10:06:20.892Z"'`,
    );
    await queryRunner.query(
      `ALTER TABLE "parent_issue" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-10-07T10:06:20.892Z"'`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-10-07T10:06:20.892Z"'`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-10-07T10:06:20.892Z"'`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-10-07T10:06:20.892Z"'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-10-07T10:06:20.892Z"'`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-10-07T10:06:20.892Z"'`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction_participant" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-10-07T10:06:20.892Z"'`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-10-07T10:06:20.892Z"'`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-10-07T10:06:20.892Z"'`,
    );
    await queryRunner.query(
      `ALTER TABLE "general_ledger" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-10-07T10:06:20.892Z"'`,
    );
    await queryRunner.query(
      `ALTER TABLE "response_template" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-10-07T10:06:20.892Z"'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tracking" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-10-07T10:06:20.892Z"'`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_default" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-10-07T10:06:20.892Z"'`,
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
      `ALTER TABLE "admin_default" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tracking" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "response_template" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "general_ledger" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction_participant" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '2024-10-03 14:44:06.496'`,
    );
    await queryRunner.query(
      `ALTER TABLE "parent_issue" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "attribute" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "attribute_set" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing_type" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "token_confirmation" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "child_issue" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "flag_listing" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_history" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer" ALTER COLUMN "deletedAt" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "gps_coordinate" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gps_coordinate" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing_attributes" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing_attributes" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_preference" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_preference" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "use"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "national_identity" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "national_identity" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "use" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "attribute_set" ADD "deletedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d5f6e460c5650518be834f7525"`,
    );
    await queryRunner.query(`DROP TABLE "auto_bid"`);
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
}
