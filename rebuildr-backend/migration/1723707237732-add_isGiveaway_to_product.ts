import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsGiveawayToProduct1723707237732 implements MigrationInterface {
    name = 'AddIsGiveawayToProduct1723707237732'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "is_giveaway" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "is_giveaway"`);
    }

}
