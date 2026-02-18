import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPublishedAtToProduct1771416826011 implements MigrationInterface {
    name = 'AddPublishedAtToProduct1771416826011'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "publishedAt" TIMESTAMP`);
        await queryRunner.query(`
          UPDATE product p
            SET "publishedAt" = "updatedAt"
          WHERE p.status IN ('SOLD', 'PUBLISHED')
          `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "publishedAt"`);
    }

}
