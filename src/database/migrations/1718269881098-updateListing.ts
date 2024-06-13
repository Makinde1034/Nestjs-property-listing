import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateListing1718269881098 implements MigrationInterface {
    name = 'UpdateListing1718269881098'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`);
        await queryRunner.query(`CREATE TABLE "amenities" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "image" character varying, "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c0777308847b3556086f2fb233e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "permission" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "permission" DROP COLUMN "permissionGroup"`);
        await queryRunner.query(`ALTER TABLE "permission" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "numberOfBedrooms"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "numberOFRentedAppartment"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "permission" ADD "functionDescription" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "permission" ADD "category" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "permission" ADD "englishLabel" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "purpose" character varying`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "city" character varying`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "numberOfRooms" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "rentedAppartment" character varying`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "negotiatable" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "pool" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "outdoorKitchen" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "garden" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "guestHouse" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "tennisCourt" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "basketballCourt" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "jacuzzi" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "bbqArea" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "maidsRoom" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "petsAllowed" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "balcony" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "gym" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "playground" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "parking" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "security" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "airConditioning" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "storageRoom" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "laundryRoom" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "conferenceRoom" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "gatedCommunity" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "indoorPlayArea" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "coveredParking" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "wifi" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "elevator" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "permission" ALTER COLUMN "useFlag" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "permission" ALTER COLUMN "staffAccess" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "listing" ALTER COLUMN "districtCity" DROP NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId") `);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bfbc9e263d4cea6d7a8c9eb3ad"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b36cb2e04bc353ca4ede00d87b"`);
        await queryRunner.query(`ALTER TABLE "listing" ALTER COLUMN "districtCity" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "permission" ALTER COLUMN "staffAccess" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "permission" ALTER COLUMN "useFlag" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "elevator"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "wifi"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "coveredParking"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "indoorPlayArea"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "gatedCommunity"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "conferenceRoom"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "laundryRoom"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "storageRoom"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "airConditioning"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "security"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "parking"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "playground"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "gym"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "balcony"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "petsAllowed"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "maidsRoom"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "bbqArea"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "jacuzzi"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "basketballCourt"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "tennisCourt"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "guestHouse"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "garden"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "outdoorKitchen"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "pool"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "negotiatable"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "rentedAppartment"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "numberOfRooms"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "purpose"`);
        await queryRunner.query(`ALTER TABLE "permission" DROP COLUMN "englishLabel"`);
        await queryRunner.query(`ALTER TABLE "permission" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "permission" DROP COLUMN "functionDescription"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" DROP COLUMN "approve"`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD "approve" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "numberOFRentedAppartment" character varying`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "numberOfBedrooms" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "permission" ADD "description" character varying`);
        await queryRunner.query(`ALTER TABLE "permission" ADD "permissionGroup" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "permission" ADD "name" character varying`);
        await queryRunner.query(`DROP TABLE "amenities"`);
        await queryRunner.query(`CREATE INDEX "IDX_bfbc9e263d4cea6d7a8c9eb3ad" ON "role_permissions_permission" ("permissionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b36cb2e04bc353ca4ede00d87b" ON "role_permissions_permission" ("roleId") `);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_bfbc9e263d4cea6d7a8c9eb3ad2" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions_permission" ADD CONSTRAINT "FK_b36cb2e04bc353ca4ede00d87b9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
