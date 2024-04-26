/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAttributeAndAttributeSetTable1714082518615
  implements MigrationInterface
{
  name = 'CreateAttributeAndAttributeSetTable1714082518615';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "message" character varying NOT NULL, "read" boolean DEFAULT false, "type" character varying, "expiredAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "recipientId" uuid, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "attribute_set" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ad382c070e04f8eb07790fc0362" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "attribute" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "type" character varying NOT NULL, "icon" character varying, "dropDownOptions" jsonb, "isRequired" boolean NOT NULL, "showInSummary" boolean NOT NULL, "hiddenToBuyers" boolean NOT NULL, "showInComparison" boolean NOT NULL, "showInFilters" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b13fb7c5c9e9dff62b60e0de729" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "attributes_attribute_set" ("attributeSetId" uuid NOT NULL, "attributeId" uuid NOT NULL, CONSTRAINT "PK_90aa00eea6e1ca1557de117177d" PRIMARY KEY ("attributeSetId", "attributeId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b58e7f495cb9fa41bbf25bf898" ON "attributes_attribute_set" ("attributeSetId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2f15f2892ea7b3f961063db794" ON "attributes_attribute_set" ("attributeId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_ab7cbe7a013ecac5da0a8f88884" FOREIGN KEY ("recipientId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "attributes_attribute_set" ADD CONSTRAINT "FK_b58e7f495cb9fa41bbf25bf8984" FOREIGN KEY ("attributeSetId") REFERENCES "attribute_set"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "attributes_attribute_set" ADD CONSTRAINT "FK_2f15f2892ea7b3f961063db7943" FOREIGN KEY ("attributeId") REFERENCES "attribute"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "attributes_attribute_set" DROP CONSTRAINT "FK_2f15f2892ea7b3f961063db7943"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attributes_attribute_set" DROP CONSTRAINT "FK_b58e7f495cb9fa41bbf25bf8984"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_ab7cbe7a013ecac5da0a8f88884"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2f15f2892ea7b3f961063db794"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b58e7f495cb9fa41bbf25bf898"`,
    );
    await queryRunner.query(`DROP TABLE "attributes_attribute_set"`);
    await queryRunner.query(`DROP TABLE "attribute"`);
    await queryRunner.query(`DROP TABLE "attribute_set"`);
    await queryRunner.query(`DROP TABLE "notification"`);
  }
}
