import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCityTable1716840086621 implements MigrationInterface {
    name = 'CreateCityTable1716840086621'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`);
        await queryRunner.query(`CREATE TABLE "city_entitity" ("id" SERIAL NOT NULL, "city" character varying NOT NULL, "lat" character varying NOT NULL, "lng" character varying NOT NULL, "country" character varying NOT NULL, "iso2" character varying NOT NULL, "admin_name" character varying NOT NULL, CONSTRAINT "PK_82e5f400a625d7400a03213915a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "roleId"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "permissionId"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_17022daf3f885f7d35423e9971e" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "role_id" integer`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "permission_id" integer`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "roleId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "PK_17022daf3f885f7d35423e9971e"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_42d6ade159e994924085de23d1a" PRIMARY KEY ("id", "roleId")`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "permissionId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "PK_42d6ade159e994924085de23d1a"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_1fcad95cc01b37848c6794bbdd8" PRIMARY KEY ("id", "roleId", "permissionId")`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "PK_1fcad95cc01b37848c6794bbdd8"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_b817d7eca3b85f22130861259dd" PRIMARY KEY ("roleId", "permissionId")`);
        await queryRunner.query(`CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId") `);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_0167acb6e0ccfcf0c6c140cec4a" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_2d3e8e7c82bdee8553b6f1e3325" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_2d3e8e7c82bdee8553b6f1e3325"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_0167acb6e0ccfcf0c6c140cec4a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "PK_b817d7eca3b85f22130861259dd"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_1fcad95cc01b37848c6794bbdd8" PRIMARY KEY ("id", "roleId", "permissionId")`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "PK_1fcad95cc01b37848c6794bbdd8"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_42d6ade159e994924085de23d1a" PRIMARY KEY ("id", "roleId")`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "permissionId"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "PK_42d6ade159e994924085de23d1a"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "PK_17022daf3f885f7d35423e9971e" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "roleId"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "permission_id"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "role_id"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "PK_17022daf3f885f7d35423e9971e"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "permissionId" integer`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "roleId" integer`);
        await queryRunner.query(`DROP TABLE "city_entitity"`);
        await queryRunner.query(`CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId") `);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
