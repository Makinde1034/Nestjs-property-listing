import { MigrationInterface, QueryRunner } from "typeorm";

export class UseSnakeCaseForJoinTable1737542176052 implements MigrationInterface {
    name = 'UseSnakeCaseForJoinTable1737542176052'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`);
        await queryRunner.query(`ALTER TABLE "userRoleRoles" DROP CONSTRAINT "FK_30a7bb21073af740ab47534ae56"`);
        await queryRunner.query(`ALTER TABLE "userRoleRoles" DROP CONSTRAINT "FK_14d91b68f602ab5eb8d51e48cf9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_14d91b68f602ab5eb8d51e48cf"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_30a7bb21073af740ab47534ae5"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "use"`);
        await queryRunner.query(`ALTER TABLE "userRoleRoles" DROP CONSTRAINT "PK_9d0e75927f05f6d462820b11dd6"`);
        await queryRunner.query(`ALTER TABLE "userRoleRoles" ADD CONSTRAINT "PK_30a7bb21073af740ab47534ae56" PRIMARY KEY ("idId_2")`);
        await queryRunner.query(`ALTER TABLE "userRoleRoles" DROP COLUMN "idId_1"`);
        await queryRunner.query(`ALTER TABLE "userRoleRoles" DROP CONSTRAINT "PK_30a7bb21073af740ab47534ae56"`);
        await queryRunner.query(`ALTER TABLE "userRoleRoles" DROP COLUMN "idId_2"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "use" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "userRoleRoles" ADD "userId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "userRoleRoles" ADD CONSTRAINT "PK_6e7394cba379cac0d75d75a02c9" PRIMARY KEY ("userId")`);
        await queryRunner.query(`ALTER TABLE "userRoleRoles" ADD "roleId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "userRoleRoles" DROP CONSTRAINT "PK_6e7394cba379cac0d75d75a02c9"`);
        await queryRunner.query(`ALTER TABLE "userRoleRoles" ADD CONSTRAINT "PK_146adc493fc320f50859723ee3c" PRIMARY KEY ("userId", "roleId")`);
        await queryRunner.query(`ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '"2025-01-22T10:36:17.739Z"'`);
        await queryRunner.query(`CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_6e7394cba379cac0d75d75a02c" ON "userRoleRoles" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_cacfca0822c650d6ae746cafd9" ON "userRoleRoles" ("roleId") `);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "userRoleRoles" ADD CONSTRAINT "FK_6e7394cba379cac0d75d75a02c9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "userRoleRoles" ADD CONSTRAINT "FK_cacfca0822c650d6ae746cafd9f" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "userRoleRoles" DROP CONSTRAINT "FK_cacfca0822c650d6ae746cafd9f"`);
        await queryRunner.query(`ALTER TABLE "userRoleRoles" DROP CONSTRAINT "FK_6e7394cba379cac0d75d75a02c9"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cacfca0822c650d6ae746cafd9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6e7394cba379cac0d75d75a02c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`);
        await queryRunner.query(`ALTER TABLE "ticket" ALTER COLUMN "updatedAt" SET DEFAULT '2025-01-22 09:46:24.837'`);
        await queryRunner.query(`ALTER TABLE "userRoleRoles" DROP CONSTRAINT "PK_146adc493fc320f50859723ee3c"`);
        await queryRunner.query(`ALTER TABLE "userRoleRoles" ADD CONSTRAINT "PK_6e7394cba379cac0d75d75a02c9" PRIMARY KEY ("userId")`);
        await queryRunner.query(`ALTER TABLE "userRoleRoles" DROP COLUMN "roleId"`);
        await queryRunner.query(`ALTER TABLE "userRoleRoles" DROP CONSTRAINT "PK_6e7394cba379cac0d75d75a02c9"`);
        await queryRunner.query(`ALTER TABLE "userRoleRoles" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "use"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`);
        await queryRunner.query(`ALTER TABLE "userRoleRoles" ADD "idId_2" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "userRoleRoles" ADD CONSTRAINT "PK_30a7bb21073af740ab47534ae56" PRIMARY KEY ("idId_2")`);
        await queryRunner.query(`ALTER TABLE "userRoleRoles" ADD "idId_1" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "userRoleRoles" DROP CONSTRAINT "PK_30a7bb21073af740ab47534ae56"`);
        await queryRunner.query(`ALTER TABLE "userRoleRoles" ADD CONSTRAINT "PK_9d0e75927f05f6d462820b11dd6" PRIMARY KEY ("idId_1", "idId_2")`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "use" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`);
        await queryRunner.query(`CREATE INDEX "IDX_30a7bb21073af740ab47534ae5" ON "userRoleRoles" ("idId_2") `);
        await queryRunner.query(`CREATE INDEX "IDX_14d91b68f602ab5eb8d51e48cf" ON "userRoleRoles" ("idId_1") `);
        await queryRunner.query(`ALTER TABLE "userRoleRoles" ADD CONSTRAINT "FK_14d91b68f602ab5eb8d51e48cf9" FOREIGN KEY ("idId_1") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "userRoleRoles" ADD CONSTRAINT "FK_30a7bb21073af740ab47534ae56" FOREIGN KEY ("idId_2") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
