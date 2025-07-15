import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPostnordRawDataToPurchase1752583842246 implements MigrationInterface {
    name = 'AddPostnordRawDataToPurchase1752583842246'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" ADD "postnordRawData" json`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "postnordRawData"`);
    }

}
