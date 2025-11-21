import { MigrationInterface, QueryRunner } from "typeorm";

export class MoveMapPinRelations1763731955277 implements MigrationInterface {
    name = 'MoveMapPinRelations1763731955277'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "map_pin" DROP CONSTRAINT "FK_2d74e8147b6217a9a6eb6e0ff13"`);
        await queryRunner.query(`ALTER TABLE "map_pin" DROP CONSTRAINT "FK_643fdbd039ae610af6501475ef3"`);
        await queryRunner.query(`ALTER TABLE "map_pin" DROP CONSTRAINT "FK_6ba284750edf63477c5aa2c1b61"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_map_pin_location"`);
        await queryRunner.query(`ALTER TABLE "map_pin" DROP CONSTRAINT "REL_643fdbd039ae610af6501475ef"`);
        await queryRunner.query(`ALTER TABLE "map_pin" DROP COLUMN "productId"`);
        await queryRunner.query(`ALTER TABLE "map_pin" DROP CONSTRAINT "REL_6ba284750edf63477c5aa2c1b6"`);
        await queryRunner.query(`ALTER TABLE "map_pin" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "map_pin" DROP CONSTRAINT "REL_2d74e8147b6217a9a6eb6e0ff1"`);
        await queryRunner.query(`ALTER TABLE "map_pin" DROP COLUMN "projectId"`);
        await queryRunner.query(`ALTER TABLE "project" ADD "mapPinId" uuid`);
        await queryRunner.query(`ALTER TABLE "project" ADD CONSTRAINT "UQ_f0366e78bdd051d290af84d1d1c" UNIQUE ("mapPinId")`);
        await queryRunner.query(`ALTER TABLE "product" ADD "mapPinId" uuid`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "UQ_1fd46df59f13012a24e5f7fb6e3" UNIQUE ("mapPinId")`);
        await queryRunner.query(`ALTER TABLE "user" ADD "mapPinId" uuid`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_4ff1fbd4c2f5e5cbbddafb27ff4" UNIQUE ("mapPinId")`);
        await queryRunner.query(`ALTER TABLE "project" ADD CONSTRAINT "FK_f0366e78bdd051d290af84d1d1c" FOREIGN KEY ("mapPinId") REFERENCES "map_pin"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_1fd46df59f13012a24e5f7fb6e3" FOREIGN KEY ("mapPinId") REFERENCES "map_pin"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_4ff1fbd4c2f5e5cbbddafb27ff4" FOREIGN KEY ("mapPinId") REFERENCES "map_pin"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_4ff1fbd4c2f5e5cbbddafb27ff4"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_1fd46df59f13012a24e5f7fb6e3"`);
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "FK_f0366e78bdd051d290af84d1d1c"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_4ff1fbd4c2f5e5cbbddafb27ff4"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "mapPinId"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "UQ_1fd46df59f13012a24e5f7fb6e3"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "mapPinId"`);
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "UQ_f0366e78bdd051d290af84d1d1c"`);
        await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "mapPinId"`);
        await queryRunner.query(`ALTER TABLE "map_pin" ADD "projectId" uuid`);
        await queryRunner.query(`ALTER TABLE "map_pin" ADD CONSTRAINT "REL_2d74e8147b6217a9a6eb6e0ff1" UNIQUE ("projectId")`);
        await queryRunner.query(`ALTER TABLE "map_pin" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "map_pin" ADD CONSTRAINT "REL_6ba284750edf63477c5aa2c1b6" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "map_pin" ADD "productId" uuid`);
        await queryRunner.query(`ALTER TABLE "map_pin" ADD CONSTRAINT "REL_643fdbd039ae610af6501475ef" UNIQUE ("productId")`);
        await queryRunner.query(`CREATE INDEX "IDX_map_pin_location" ON "map_pin" USING GiST ("location") `);
        await queryRunner.query(`ALTER TABLE "map_pin" ADD CONSTRAINT "FK_6ba284750edf63477c5aa2c1b61" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "map_pin" ADD CONSTRAINT "FK_643fdbd039ae610af6501475ef3" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "map_pin" ADD CONSTRAINT "FK_2d74e8147b6217a9a6eb6e0ff13" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
