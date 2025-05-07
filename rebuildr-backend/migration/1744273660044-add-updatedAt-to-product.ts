import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUpdatedAtToProduct1744273660044 implements MigrationInterface {
    name = 'AddUpdatedAtToProduct1744273660044'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "updated_at"`);
    }

}
