import { MigrationInterface, QueryRunner } from "typeorm";

export class NullablePaymentMethod1752223151666 implements MigrationInterface {
    name = 'NullablePaymentMethod1752223151666'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" ALTER COLUMN "paymentMethod" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" ALTER COLUMN "paymentMethod" SET NOT NULL`);
    }

}
