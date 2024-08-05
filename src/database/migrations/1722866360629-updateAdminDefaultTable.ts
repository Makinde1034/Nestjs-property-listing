/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAdminDefaultTable1722866360629
  implements MigrationInterface
{
  name = 'UpdateAdminDefaultTable1722866360629';

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
      `CREATE TYPE "public"."general_ledger_transactiontype_enum" AS ENUM('debit', 'credit')`,
    );
    await queryRunner.query(
      `CREATE TABLE "general_ledger" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accountNumber" character varying(100) NOT NULL, "description" character varying(255) NOT NULL, "amount" numeric(12,2) NOT NULL, "transactionType" "public"."general_ledger_transactiontype_enum" NOT NULL, "reference" character varying(50) NOT NULL, "saiiFee" numeric(12,2) NOT NULL, "status" character varying NOT NULL, "needAdminReview" boolean NOT NULL, "offerId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a148029e2181866d8a7fe139981" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "auction" DROP COLUMN "title"`);
    await queryRunner.query(`ALTER TABLE "auction" DROP COLUMN "description"`);
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "titleInEnglish" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "titleInArabic" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "arabicDescription" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "englishDescription" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "imageLink" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_default" ADD "daysToAuctionRegistrationEnd" integer  NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_default" ADD "daysToAuctionRegistrationStart" integer  NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ALTER COLUMN "liveFor" DROP NOT NULL`,
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
      `ALTER TABLE "auction" ALTER COLUMN "liveFor" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_default" DROP COLUMN "daysToAuctionRegistrationStart"`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_default" DROP COLUMN "daysToAuctionRegistrationEnd"`,
    );
    await queryRunner.query(`ALTER TABLE "auction" DROP COLUMN "imageLink"`);
    await queryRunner.query(
      `ALTER TABLE "auction" DROP COLUMN "englishDescription"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" DROP COLUMN "arabicDescription"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" DROP COLUMN "titleInArabic"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" DROP COLUMN "titleInEnglish"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "description" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "title" character varying NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "general_ledger"`);
    await queryRunner.query(
      `DROP TYPE "public"."general_ledger_transactiontype_enum"`,
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
