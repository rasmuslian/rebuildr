import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAdditionalInfoToProduct1769173786060 implements MigrationInterface {
    name = 'AddAdditionalInfoToProduct1769173786060'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "additionalInfo" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "additionalInfo"`);
    }

}
