/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationScopeTable1715861865674
  implements MigrationInterface
{
  name = 'CreateNotificationScopeTable1715861865674';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "notification_scope" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "scopeGroup" character varying, CONSTRAINT "PK_f676beb8e29a488475ce85d73bb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_preference" DROP COLUMN "sms"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_preference" DROP COLUMN "pushNotification"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_preference" ADD "mobile" boolean DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_preference" ADD "desktop" boolean DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_preference" ADD "scopeId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_preference" DROP CONSTRAINT "FK_9e2c85e2dface923dfa5ee630e3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_preference" DROP CONSTRAINT "REL_9e2c85e2dface923dfa5ee630e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_preference" ADD CONSTRAINT "FK_9e2c85e2dface923dfa5ee630e3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_preference" ADD CONSTRAINT "FK_c93b08c70fde8f1d9c1d1691553" FOREIGN KEY ("scopeId") REFERENCES "notification_scope"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_notification_preference" DROP CONSTRAINT "FK_c93b08c70fde8f1d9c1d1691553"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_preference" DROP CONSTRAINT "FK_9e2c85e2dface923dfa5ee630e3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_preference" ADD CONSTRAINT "REL_9e2c85e2dface923dfa5ee630e" UNIQUE ("userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_preference" ADD CONSTRAINT "FK_9e2c85e2dface923dfa5ee630e3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_preference" DROP COLUMN "scopeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_preference" DROP COLUMN "desktop"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_preference" DROP COLUMN "mobile"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_preference" ADD "pushNotification" boolean DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_preference" ADD "sms" boolean DEFAULT true`,
    );
    await queryRunner.query(`DROP TABLE "notification_scope"`);
  }
}
