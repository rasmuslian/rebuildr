import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIconToCategory1725372178746 implements MigrationInterface {
    name = 'AddIconToCategory1725372178746'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category" ADD "icon_id" uuid`);
        await queryRunner.query(`ALTER TABLE "category" ADD CONSTRAINT "UQ_4acc05cb7efa59a5018cdd76d39" UNIQUE ("icon_id")`);
        await queryRunner.query(`ALTER TABLE "category" ADD CONSTRAINT "FK_4acc05cb7efa59a5018cdd76d39" FOREIGN KEY ("icon_id") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category" DROP CONSTRAINT "FK_4acc05cb7efa59a5018cdd76d39"`);
        await queryRunner.query(`ALTER TABLE "category" DROP CONSTRAINT "UQ_4acc05cb7efa59a5018cdd76d39"`);
        await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "icon_id"`);
    }

}
