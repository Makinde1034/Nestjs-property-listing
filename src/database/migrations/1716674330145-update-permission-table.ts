/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePermissionTable1716674330145 implements MigrationInterface {
  name = 'UpdatePermissionTable1716674330145';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "permission" DROP COLUMN "visible"`);
    await queryRunner.query(
      `ALTER TABLE "permission" ADD "description" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ADD "remarks" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ADD "arabicLabel" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ADD "approveFlag" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ADD "useFlag" boolean DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ADD "staffAccess" boolean DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ADD "individualAccess" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ADD "companyAccess" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ALTER COLUMN "slug" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "permission" ALTER COLUMN "slug" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" DROP COLUMN "companyAccess"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" DROP COLUMN "individualAccess"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" DROP COLUMN "staffAccess"`,
    );
    await queryRunner.query(`ALTER TABLE "permission" DROP COLUMN "useFlag"`);
    await queryRunner.query(
      `ALTER TABLE "permission" DROP COLUMN "approveFlag"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" DROP COLUMN "arabicLabel"`,
    );
    await queryRunner.query(`ALTER TABLE "permission" DROP COLUMN "remarks"`);
    await queryRunner.query(
      `ALTER TABLE "permission" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission" ADD "visible" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(`DROP TABLE "review"`);
  }
}
