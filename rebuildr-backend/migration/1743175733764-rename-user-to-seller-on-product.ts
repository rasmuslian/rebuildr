import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameUserToSellerOnProduct1743175733764 implements MigrationInterface {
    name = 'RenameUserToSellerOnProduct1743175733764'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_3e59a34134d840e83c2010fac9a"`);
        await queryRunner.query(`ALTER TABLE "product" RENAME COLUMN "user_id" TO "seller_id"`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_79a3ae0442388a2418ec67a3120" FOREIGN KEY ("seller_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_79a3ae0442388a2418ec67a3120"`);
        await queryRunner.query(`ALTER TABLE "product" RENAME COLUMN "seller_id" TO "user_id"`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_3e59a34134d840e83c2010fac9a" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
