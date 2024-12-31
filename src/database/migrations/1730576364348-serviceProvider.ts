/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class ServiceProvider1730576364348 implements MigrationInterface {
  name = 'ServiceProvider1730576364348';

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
      `CREATE TABLE "service_status" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "serviceProviderId" character varying NOT NULL, "serviceId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "status" character varying NOT NULL DEFAULT 'inactive', "deletedAt" TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "servicePrividerId" uuid, CONSTRAINT "REL_e7333093680d7a8140964cb027" UNIQUE ("serviceId"), CONSTRAINT "PK_6468f21b77a828e8aeac179d6c1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6468f21b77a828e8aeac179d6c" ON "service_status" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "service" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "englishServiceName" character varying NOT NULL, "arabicServiceName" character varying NOT NULL, "active" boolean NOT NULL DEFAULT false, "isWorkLicenseRequired" boolean NOT NULL DEFAULT false, "icon" character varying, "pricing" character varying NOT NULL, "servicePrividerId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_85a21558c006647cd76fdce044b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_85a21558c006647cd76fdce044" ON "service" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "service_provider" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "ibanCertificate" character varying, "workLicense" character varying, "idOrCr" character varying, "iban" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "providerStatus" character varying NOT NULL DEFAULT 'pending', "deletedAt" TIMESTAMP, "coverageArea" character varying NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7610a92ca242cb29d96009caa19" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7610a92ca242cb29d96009caa1" ON "service_provider" ("id") `,
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
      `ALTER TABLE "activity_log" ADD "serviceProviderId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '"2024-11-02T19:39:25.696Z"'`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" ALTER COLUMN "placement" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "currentTermOfservice" DROP DEFAULT`,
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
    await queryRunner.query(
      `ALTER TABLE "service_status" ADD CONSTRAINT "FK_4a6cc79ec11cdfb2092aa526fed" FOREIGN KEY ("servicePrividerId") REFERENCES "service_provider"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_status" ADD CONSTRAINT "FK_e7333093680d7a8140964cb027e" FOREIGN KEY ("serviceId") REFERENCES "service"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service" ADD CONSTRAINT "FK_ecd880b411bb5d2caeaa36826cf" FOREIGN KEY ("servicePrividerId") REFERENCES "service_provider"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" ADD CONSTRAINT "FK_dc8d83229bf9130441dde2b3752" FOREIGN KEY ("serviceProviderId") REFERENCES "article"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity_log" DROP CONSTRAINT "FK_dc8d83229bf9130441dde2b3752"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service" DROP CONSTRAINT "FK_ecd880b411bb5d2caeaa36826cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_status" DROP CONSTRAINT "FK_e7333093680d7a8140964cb027e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_status" DROP CONSTRAINT "FK_4a6cc79ec11cdfb2092aa526fed"`,
    );
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
      `ALTER TABLE "user" ALTER COLUMN "currentTermOfservice" SET DEFAULT 'v1'`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" ALTER COLUMN "placement" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '2024-10-31 19:58:45.696'`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_log" DROP COLUMN "serviceProviderId"`,
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
      `DROP INDEX "public"."IDX_7610a92ca242cb29d96009caa1"`,
    );
    await queryRunner.query(`DROP TABLE "service_provider"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_85a21558c006647cd76fdce044"`,
    );
    await queryRunner.query(`DROP TABLE "service"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6468f21b77a828e8aeac179d6c"`,
    );
    await queryRunner.query(`DROP TABLE "service_status"`);
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
