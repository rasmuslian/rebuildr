import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductDisplaysToBygghjalpenMessage1781712000000 implements MigrationInterface {
    name = 'AddProductDisplaysToBygghjalpenMessage1781712000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bygghjalpen_message" ADD "productDisplays" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bygghjalpen_message" DROP COLUMN "productDisplays"`);
    }

}