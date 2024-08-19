import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDescriptionToProduct1724065146238 implements MigrationInterface {
    name = 'AddDescriptionToProduct1724065146238'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "description" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "description"`);
    }

}
