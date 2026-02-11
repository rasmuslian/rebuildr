import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShortTextProject1770815486196 implements MigrationInterface {
    name = 'AddShortTextProject1770815486196'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project" ADD "shortText" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "shortText"`);
    }

}
