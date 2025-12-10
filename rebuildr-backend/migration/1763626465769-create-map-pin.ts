import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMapPin1763626465769 implements MigrationInterface {
    name = 'CreateMapPin1763626465769'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "map_pin" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "location" geometry(Point,4326), "address" character varying, "productId" uuid, "userId" uuid, "projectId" uuid, CONSTRAINT "REL_643fdbd039ae610af6501475ef" UNIQUE ("productId"), CONSTRAINT "REL_6ba284750edf63477c5aa2c1b6" UNIQUE ("userId"), CONSTRAINT "REL_2d74e8147b6217a9a6eb6e0ff1" UNIQUE ("projectId"), CONSTRAINT "PK_7b0aff38fb4617f40647628cc37" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "map_pin" ADD CONSTRAINT "FK_643fdbd039ae610af6501475ef3" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "map_pin" ADD CONSTRAINT "FK_6ba284750edf63477c5aa2c1b61" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "map_pin" ADD CONSTRAINT "FK_2d74e8147b6217a9a6eb6e0ff13" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`Create INDEX "IDX_map_pin_location" ON "map_pin" USING GIST ("location")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_map_pin_location"`);
        await queryRunner.query(`ALTER TABLE "map_pin" DROP CONSTRAINT "FK_2d74e8147b6217a9a6eb6e0ff13"`);
        await queryRunner.query(`ALTER TABLE "map_pin" DROP CONSTRAINT "FK_6ba284750edf63477c5aa2c1b61"`);
        await queryRunner.query(`ALTER TABLE "map_pin" DROP CONSTRAINT "FK_643fdbd039ae610af6501475ef3"`);
        await queryRunner.query(`DROP TABLE "map_pin"`);
    }
}
