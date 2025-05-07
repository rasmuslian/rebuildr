import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBrand1744189241743 implements MigrationInterface {
    name = 'AddBrand1744189241743'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" RENAME COLUMN "brand" TO "brand_id"`);
        await queryRunner.query(`CREATE TYPE "public"."brand_type_enum" AS ENUM('OTHER', 'REGULAR')`);
        await queryRunner.query(`CREATE TABLE "brand" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "type" "public"."brand_type_enum" NOT NULL DEFAULT 'REGULAR', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a5d20765ddd942eb5de4eee2d7f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "category_brands_brand" ("category_id" uuid NOT NULL, "brand_id" uuid NOT NULL, CONSTRAINT "PK_178179b2068590aad4c1f9b8f21" PRIMARY KEY ("category_id", "brand_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_870340baa27f4bfd36c6ac511b" ON "category_brands_brand" ("category_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_ec3cf4300a10c6818aab276351" ON "category_brands_brand" ("brand_id") `);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "brand_id"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "brand_id" uuid`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_2eb5ce4324613b4b457c364f4a2" FOREIGN KEY ("brand_id") REFERENCES "brand"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "category_brands_brand" ADD CONSTRAINT "FK_870340baa27f4bfd36c6ac511b1" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "category_brands_brand" ADD CONSTRAINT "FK_ec3cf4300a10c6818aab2763511" FOREIGN KEY ("brand_id") REFERENCES "brand"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category_brands_brand" DROP CONSTRAINT "FK_ec3cf4300a10c6818aab2763511"`);
        await queryRunner.query(`ALTER TABLE "category_brands_brand" DROP CONSTRAINT "FK_870340baa27f4bfd36c6ac511b1"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_2eb5ce4324613b4b457c364f4a2"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "brand_id"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "brand_id" character varying`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ec3cf4300a10c6818aab276351"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_870340baa27f4bfd36c6ac511b"`);
        await queryRunner.query(`DROP TABLE "category_brands_brand"`);
        await queryRunner.query(`DROP TABLE "brand"`);
        await queryRunner.query(`DROP TYPE "public"."brand_type_enum"`);
        await queryRunner.query(`ALTER TABLE "product" RENAME COLUMN "brand_id" TO "brand"`);
    }

}
