import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShowDetailsOnMapProject1769775704458 implements MigrationInterface {
    name = 'AddShowDetailsOnMapProject1769775704458'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project" ADD "showDetailsOnMap" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "showDetailsOnMap"`);
    }

}
