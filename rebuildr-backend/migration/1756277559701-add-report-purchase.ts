import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReportPurchase1756277559701 implements MigrationInterface {
    name = 'AddReportPurchase1756277559701'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."report_purchase_type_enum" AS ENUM('NOT_AS_DESCRIBED ', 'DAMAGED', 'WRONG_PRODUCT', 'PRODUCT_MISSING', 'OTHER')`);
        await queryRunner.query(`CREATE TABLE "report_purchase" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "type" "public"."report_purchase_type_enum" NOT NULL, "message" character varying NOT NULL, "resolution" character varying, "purchaseId" uuid NOT NULL, CONSTRAINT "REL_a59bbdeb911e287dccf78d6255" UNIQUE ("purchaseId"), CONSTRAINT "PK_d79e61a6e92991ddda90674c4de" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "report_purchase" ADD CONSTRAINT "FK_a59bbdeb911e287dccf78d62556" FOREIGN KEY ("purchaseId") REFERENCES "purchase"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "report_purchase" DROP CONSTRAINT "FK_a59bbdeb911e287dccf78d62556"`);
        await queryRunner.query(`DROP TABLE "report_purchase"`);
        await queryRunner.query(`DROP TYPE "public"."report_purchase_type_enum"`);
    }

}
