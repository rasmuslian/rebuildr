import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPurchaseToMessage1776860203681 implements MigrationInterface {
    name = 'AddPurchaseToMessage1776860203681'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message" ADD "purchaseId" uuid`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_e5cbcb258fc22359b1e5afd4300" FOREIGN KEY ("purchaseId") REFERENCES "purchase"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_e5cbcb258fc22359b1e5afd4300"`);
        await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "purchaseId"`);
    }

}
