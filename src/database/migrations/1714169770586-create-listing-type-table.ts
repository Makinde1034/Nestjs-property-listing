/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateListingTypeTable1714169770586 implements MigrationInterface {
  name = 'CreateListingTypeTable1714169770586';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "listing_type" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "icon" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1ceacd881fec4bb75f74f2c7c5c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "listing_types_attribute_sets" ("listingTypeId" uuid NOT NULL, "attributeSetId" uuid NOT NULL, CONSTRAINT "PK_8fc33957d4d8add464853499c26" PRIMARY KEY ("listingTypeId", "attributeSetId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_af6107b3c1c84592154d14b8e2" ON "listing_types_attribute_sets" ("listingTypeId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e48884980a3c9636df814be3f8" ON "listing_types_attribute_sets" ("attributeSetId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "listing_types_attribute_sets" ADD CONSTRAINT "FK_af6107b3c1c84592154d14b8e29" FOREIGN KEY ("listingTypeId") REFERENCES "listing_type"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing_types_attribute_sets" ADD CONSTRAINT "FK_e48884980a3c9636df814be3f8b" FOREIGN KEY ("attributeSetId") REFERENCES "attribute_set"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing_types_attribute_sets" DROP CONSTRAINT "FK_e48884980a3c9636df814be3f8b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing_types_attribute_sets" DROP CONSTRAINT "FK_af6107b3c1c84592154d14b8e29"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e48884980a3c9636df814be3f8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_af6107b3c1c84592154d14b8e2"`,
    );
    await queryRunner.query(`DROP TABLE "listing_types_attribute_sets"`);
    await queryRunner.query(`DROP TABLE "listing_type"`);
  }
}
