import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReportProduct1756465488150 implements MigrationInterface {
    name = 'AddReportProduct1756465488150'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."report_product_type_enum" AS ENUM('INCORRECT_INFORMATION', 'MISLEADING_ADVERTISEMENT', 'DUPLICATE_OR_SPAM', 'IRRELEVANT_PRODUCT', 'UNREASONABLE_PRICE', 'OTHER')`);
        await queryRunner.query(`CREATE TABLE "report_product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "type" "public"."report_product_type_enum" NOT NULL, "message" character varying NOT NULL, "reporterId" uuid NOT NULL, "productId" uuid NOT NULL, CONSTRAINT "PK_6d6faf96a70a5e4fc7dc81c9913" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "report_product" ADD CONSTRAINT "FK_31a8c1fbcd8741b2f99b02ab1e8" FOREIGN KEY ("reporterId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "report_product" ADD CONSTRAINT "FK_b511ff6e8bf463eeb38578d5eb7" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "report_product" DROP CONSTRAINT "FK_b511ff6e8bf463eeb38578d5eb7"`);
        await queryRunner.query(`ALTER TABLE "report_product" DROP CONSTRAINT "FK_31a8c1fbcd8741b2f99b02ab1e8"`);
        await queryRunner.query(`DROP TABLE "report_product"`);
        await queryRunner.query(`DROP TYPE "public"."report_product_type_enum"`);
    }

}
