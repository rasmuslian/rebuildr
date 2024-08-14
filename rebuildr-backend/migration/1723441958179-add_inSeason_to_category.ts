import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInSeasonToCategory1723441958179 implements MigrationInterface {
    name = 'AddInSeasonToCategory1723441958179'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category" ADD "in_season" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "in_season"`);
    }

}
