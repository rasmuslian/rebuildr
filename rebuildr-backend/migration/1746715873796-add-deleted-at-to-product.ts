import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeletedAtToProduct1746715873796 implements MigrationInterface {
    name = 'AddDeletedAtToProduct1746715873796'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "deleted_at"`);
    }

}
