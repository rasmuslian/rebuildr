import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCo2SavingProduct1770995428918 implements MigrationInterface {
    name = 'AddCo2SavingProduct1770995428918'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "co2Saving" double precision`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "co2Saving"`);
    }

}