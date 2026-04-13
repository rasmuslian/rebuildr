import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBanner1776069172601 implements MigrationInterface {
    name = 'AddBanner1776069172601'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."banner_action_enum" AS ENUM('SELL')`);
        await queryRunner.query(`CREATE TYPE "public"."banner_presetbackground_enum" AS ENUM('REBUILDR', 'WOOD', 'METALLIC')`);
        await queryRunner.query(`CREATE TABLE "banner" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "label" character varying NOT NULL, "title" character varying NOT NULL, "url" character varying, "action" "public"."banner_action_enum", "presetBackground" "public"."banner_presetbackground_enum" NOT NULL DEFAULT 'REBUILDR', "active" boolean NOT NULL DEFAULT true, "backgroundImageId" uuid, CONSTRAINT "REL_e571c767fc5ab2b500e6da9bb4" UNIQUE ("backgroundImageId"), CONSTRAINT "PK_6d9e2570b3d85ba37b681cd4256" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "banner" ADD CONSTRAINT "FK_e571c767fc5ab2b500e6da9bb4b" FOREIGN KEY ("backgroundImageId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "banner" DROP CONSTRAINT "FK_e571c767fc5ab2b500e6da9bb4b"`);
        await queryRunner.query(`DROP TABLE "banner"`);
        await queryRunner.query(`DROP TYPE "public"."banner_presetbackground_enum"`);
        await queryRunner.query(`DROP TYPE "public"."banner_action_enum"`);
    }

}
