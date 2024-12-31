/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class NotificationMessage1731876770986 implements MigrationInterface {
  name = 'NotificationMessage1731876770986';

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
      `CREATE TABLE "notification_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "scope" character varying NOT NULL, "event" character varying NOT NULL, "timing" character varying, "email" boolean NOT NULL, "emailTemplate" character varying, "icon" character varying, "pushNotification" boolean NOT NULL, "systemNotification" boolean NOT NULL, "recipients" character varying NOT NULL, "title" character varying NOT NULL, "body" character varying NOT NULL, "arabicTitle" character varying NOT NULL, "arabicBody" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_025a03ac35a495f0a6d8730350d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_025a03ac35a495f0a6d8730350" ON "notification_messages" ("id") `,
    );
    await queryRunner.query(`ALTER TABLE "admin_default" DROP COLUMN "saii"`);
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "use"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "use" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_default" ADD "promptRatingTime" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_default" ADD "saiiFromSale" numeric NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_default" ADD "saiiForRent" numeric NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-11-17T20:52:53.151Z"'`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_default" ALTER COLUMN "ticketAging" SET NOT NULL`,
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
      `ALTER TABLE "admin_default" ALTER COLUMN "ticketAging" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '2024-11-15 14:12:01.565'`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_default" DROP COLUMN "saiiForRent"`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_default" DROP COLUMN "saiiFromSale"`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_default" DROP COLUMN "promptRatingTime"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "use"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "use" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_default" ADD "saii" numeric NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_025a03ac35a495f0a6d8730350"`,
    );
    await queryRunner.query(`DROP TABLE "notification_messages"`);
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
