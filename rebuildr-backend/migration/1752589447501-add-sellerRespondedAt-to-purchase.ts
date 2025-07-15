import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSellerRespondedAtToPurchase1752589447501 implements MigrationInterface {
    name = 'AddSellerRespondedAtToPurchase1752589447501'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" ADD "sellerRespondedAt" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "sellerRespondedAt"`);
    }

}
