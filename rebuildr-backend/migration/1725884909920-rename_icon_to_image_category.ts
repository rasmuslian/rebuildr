import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameIconToImageCategory1725884909920 implements MigrationInterface {
    name = 'RenameIconToImageCategory1725884909920'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category" DROP CONSTRAINT "FK_4acc05cb7efa59a5018cdd76d39"`);
        await queryRunner.query(`ALTER TABLE "category" RENAME COLUMN "icon_id" TO "image_id"`);
        await queryRunner.query(`ALTER TABLE "category" RENAME CONSTRAINT "UQ_4acc05cb7efa59a5018cdd76d39" TO "UQ_dc252738f70366595ac88f5a98f"`);
        await queryRunner.query(`ALTER TABLE "category" ADD CONSTRAINT "FK_dc252738f70366595ac88f5a98f" FOREIGN KEY ("image_id") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category" DROP CONSTRAINT "FK_dc252738f70366595ac88f5a98f"`);
        await queryRunner.query(`ALTER TABLE "category" RENAME CONSTRAINT "UQ_dc252738f70366595ac88f5a98f" TO "UQ_4acc05cb7efa59a5018cdd76d39"`);
        await queryRunner.query(`ALTER TABLE "category" RENAME COLUMN "image_id" TO "icon_id"`);
        await queryRunner.query(`ALTER TABLE "category" ADD CONSTRAINT "FK_4acc05cb7efa59a5018cdd76d39" FOREIGN KEY ("icon_id") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
