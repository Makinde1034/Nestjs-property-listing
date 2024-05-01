/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIssueCategoryTable1714604203023
  implements MigrationInterface
{
  name = 'CreateIssueCategoryTable1714604203023';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "issue_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "placement" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_68e4d81f7efc753b45381d06341" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "issue" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "message" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "categoryId" uuid, CONSTRAINT "PK_f80e086c249b9f3f3ff2fd321b7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "issue" ADD CONSTRAINT "FK_55ac7f9832e363445ccd0086909" FOREIGN KEY ("categoryId") REFERENCES "issue_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "issue" DROP CONSTRAINT "FK_55ac7f9832e363445ccd0086909"`,
    );
    await queryRunner.query(`DROP TABLE "issue"`);
    await queryRunner.query(`DROP TABLE "issue_category"`);
  }
}
