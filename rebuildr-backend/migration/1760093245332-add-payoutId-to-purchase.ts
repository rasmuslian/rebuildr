import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPayoutIdToPurchase1760093245332 implements MigrationInterface {
    name = 'AddPayoutIdToPurchase1760093245332'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" ADD "payoutId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "payoutId"`);
    }

}
