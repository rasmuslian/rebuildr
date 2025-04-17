import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveNullableCondition1744888353922 implements MigrationInterface {
    name = 'RemoveNullableCondition1744888353922'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "condition" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "condition" SET DEFAULT 'GOOD'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "condition" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "condition" DROP NOT NULL`);
    }

}
