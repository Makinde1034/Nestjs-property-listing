/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationPreferenceTable1715205917146
  implements MigrationInterface
{
  name = 'CreateNotificationPreferenceTable1715205917146';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_notification_preference" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" boolean DEFAULT true, "sms" boolean DEFAULT true, "pushNotification" boolean DEFAULT true, "userId" uuid, CONSTRAINT "REL_9e2c85e2dface923dfa5ee630e" UNIQUE ("userId"), CONSTRAINT "PK_98bedc3257235969f6ff2ec6682" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "twoFaRequired" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_preference" ADD CONSTRAINT "FK_9e2c85e2dface923dfa5ee630e3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_notification_preference" DROP CONSTRAINT "FK_9e2c85e2dface923dfa5ee630e3"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "twoFaRequired"`);
    await queryRunner.query(`DROP TABLE "user_notification_preference"`);
  }
}
