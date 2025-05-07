import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameColumn1744203783671 implements MigrationInterface {
    name = 'RenameColumn1744203783671'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "FK_0939e72c072f2ad3bf460464738"`);
        await queryRunner.query(`ALTER TABLE "file" RENAME COLUMN "product_images_id" TO "product_image_id"`);
        await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "FK_edbc9e9632307c1d5053b42d3fc" FOREIGN KEY ("product_image_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "FK_edbc9e9632307c1d5053b42d3fc"`);
        await queryRunner.query(`ALTER TABLE "file" RENAME COLUMN "product_image_id" TO "product_images_id"`);
        await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "FK_0939e72c072f2ad3bf460464738" FOREIGN KEY ("product_images_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
