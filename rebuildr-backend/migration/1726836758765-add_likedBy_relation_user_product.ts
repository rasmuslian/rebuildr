import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLikedByRelationUserProduct1726836758765 implements MigrationInterface {
    name = 'AddLikedByRelationUserProduct1726836758765'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product_liked_by_user" ("product_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_69979d6ef565bf7262e5ed8563a" PRIMARY KEY ("product_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fe960bce1f627859071dbf30cc" ON "product_liked_by_user" ("product_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_470df2a6d0495f48947b74432a" ON "product_liked_by_user" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "product_liked_by_user" ADD CONSTRAINT "FK_fe960bce1f627859071dbf30cc6" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "product_liked_by_user" ADD CONSTRAINT "FK_470df2a6d0495f48947b74432a3" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_liked_by_user" DROP CONSTRAINT "FK_470df2a6d0495f48947b74432a3"`);
        await queryRunner.query(`ALTER TABLE "product_liked_by_user" DROP CONSTRAINT "FK_fe960bce1f627859071dbf30cc6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_470df2a6d0495f48947b74432a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fe960bce1f627859071dbf30cc"`);
        await queryRunner.query(`DROP TABLE "product_liked_by_user"`);
    }

}
