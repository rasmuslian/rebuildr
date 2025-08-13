import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAbortedByToPurchase1755008087985 implements MigrationInterface {
    name = 'AddAbortedByToPurchase1755008087985'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" ADD "abortedById" uuid`);
        await queryRunner.query(`ALTER TABLE "purchase" ADD CONSTRAINT "FK_1227d555478966e8c19e231f680" FOREIGN KEY ("abortedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" DROP CONSTRAINT "FK_1227d555478966e8c19e231f680"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "abortedById"`);
    }

}
