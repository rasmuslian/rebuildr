import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPriceToProduct1718354590195 implements MigrationInterface {
    name = 'AddPriceToProduct1718354590195'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "price" numeric NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "price"`);
    }

}
