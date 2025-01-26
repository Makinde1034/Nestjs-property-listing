import { MigrationInterface, QueryRunner } from "typeorm";

export class RenamerolePermisionsPermisionTable1737539181728 implements MigrationInterface {
    name = 'RenamerolePermisionsPermisionTable1737539181728'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`);
        await queryRunner.query(`CREATE TABLE "attributesAttributeSet" ("idId_1" uuid NOT NULL, "idId_2" uuid NOT NULL, CONSTRAINT "PK_197c135e384092e9ad91fd335ca" PRIMARY KEY ("idId_1", "idId_2"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f38785408149350ba8de3dadd7" ON "attributesAttributeSet" ("idId_1") `);
        await queryRunner.query(`CREATE INDEX "IDX_d86ebe399f8968c1da54f951aa" ON "attributesAttributeSet" ("idId_2") `);
        await queryRunner.query(`CREATE TABLE "listingTypesAttributeSets" ("idId_1" uuid NOT NULL, "idId_2" uuid NOT NULL, CONSTRAINT "PK_b6f764f0e2f3bc97b3c1d4a2a6a" PRIMARY KEY ("idId_1", "idId_2"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e6b5724687e0e6f64071d68619" ON "listingTypesAttributeSets" ("idId_1") `);
        await queryRunner.query(`CREATE INDEX "IDX_d8734f620157bb9053f690b0ed" ON "listingTypesAttributeSets" ("idId_2") `);
        await queryRunner.query(`CREATE TABLE "rolePermissionsPermission" ("idId_1" integer NOT NULL, "idId_2" integer NOT NULL, CONSTRAINT "PK_a2b3c02dd2689d511b6f8e36f2c" PRIMARY KEY ("idId_1", "idId_2"))`);
        await queryRunner.query(`CREATE INDEX "IDX_82ff11255069242448717c0803" ON "rolePermissionsPermission" ("idId_1") `);
        await queryRunner.query(`CREATE INDEX "IDX_27da682ee8ce111996e04a60a5" ON "rolePermissionsPermission" ("idId_2") `);
        await queryRunner.query(`CREATE TABLE "userRoleRoles" ("idId_1" uuid NOT NULL, "idId_2" integer NOT NULL, CONSTRAINT "PK_9d0e75927f05f6d462820b11dd6" PRIMARY KEY ("idId_1", "idId_2"))`);
        await queryRunner.query(`CREATE INDEX "IDX_14d91b68f602ab5eb8d51e48cf" ON "userRoleRoles" ("idId_1") `);
        await queryRunner.query(`CREATE INDEX "IDX_30a7bb21073af740ab47534ae5" ON "userRoleRoles" ("idId_2") `);
        await queryRunner.query(`ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '"2025-01-22T09:46:24.837Z"'`);
        await queryRunner.query(`ALTER TABLE "attributesAttributeSet" ADD CONSTRAINT "FK_f38785408149350ba8de3dadd78" FOREIGN KEY ("idId_1") REFERENCES "attribute_set"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "attributesAttributeSet" ADD CONSTRAINT "FK_d86ebe399f8968c1da54f951aa5" FOREIGN KEY ("idId_2") REFERENCES "attribute"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "listingTypesAttributeSets" ADD CONSTRAINT "FK_e6b5724687e0e6f64071d686190" FOREIGN KEY ("idId_1") REFERENCES "listing_type"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "listingTypesAttributeSets" ADD CONSTRAINT "FK_d8734f620157bb9053f690b0ed7" FOREIGN KEY ("idId_2") REFERENCES "attribute_set"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rolePermissionsPermission" ADD CONSTRAINT "FK_82ff11255069242448717c08039" FOREIGN KEY ("idId_1") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "rolePermissionsPermission" ADD CONSTRAINT "FK_27da682ee8ce111996e04a60a5d" FOREIGN KEY ("idId_2") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "userRoleRoles" ADD CONSTRAINT "FK_14d91b68f602ab5eb8d51e48cf9" FOREIGN KEY ("idId_1") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "userRoleRoles" ADD CONSTRAINT "FK_30a7bb21073af740ab47534ae56" FOREIGN KEY ("idId_2") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "userRoleRoles" DROP CONSTRAINT "FK_30a7bb21073af740ab47534ae56"`);
        await queryRunner.query(`ALTER TABLE "userRoleRoles" DROP CONSTRAINT "FK_14d91b68f602ab5eb8d51e48cf9"`);
        await queryRunner.query(`ALTER TABLE "rolePermissionsPermission" DROP CONSTRAINT "FK_27da682ee8ce111996e04a60a5d"`);
        await queryRunner.query(`ALTER TABLE "rolePermissionsPermission" DROP CONSTRAINT "FK_82ff11255069242448717c08039"`);
        await queryRunner.query(`ALTER TABLE "listingTypesAttributeSets" DROP CONSTRAINT "FK_d8734f620157bb9053f690b0ed7"`);
        await queryRunner.query(`ALTER TABLE "listingTypesAttributeSets" DROP CONSTRAINT "FK_e6b5724687e0e6f64071d686190"`);
        await queryRunner.query(`ALTER TABLE "attributesAttributeSet" DROP CONSTRAINT "FK_d86ebe399f8968c1da54f951aa5"`);
        await queryRunner.query(`ALTER TABLE "attributesAttributeSet" DROP CONSTRAINT "FK_f38785408149350ba8de3dadd78"`);
        await queryRunner.query(`ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '2025-01-16 11:59:22.254'`);
        await queryRunner.query(`DROP INDEX "public"."IDX_30a7bb21073af740ab47534ae5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_14d91b68f602ab5eb8d51e48cf"`);
        await queryRunner.query(`DROP TABLE "userRoleRoles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_27da682ee8ce111996e04a60a5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_82ff11255069242448717c0803"`);
        await queryRunner.query(`DROP TABLE "rolePermissionsPermission"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d8734f620157bb9053f690b0ed"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e6b5724687e0e6f64071d68619"`);
        await queryRunner.query(`DROP TABLE "listingTypesAttributeSets"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d86ebe399f8968c1da54f951aa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f38785408149350ba8de3dadd7"`);
        await queryRunner.query(`DROP TABLE "attributesAttributeSet"`);
        await queryRunner.query(`CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId") `);
    }

}
