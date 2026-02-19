import { MigrationInterface, QueryRunner } from "typeorm";
import { PageEnum } from "../src/constants/enums";

export class CreatePageContent1771492715532 implements MigrationInterface {
    name = 'CreatePageContent1771492715532'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."page_content_page_enum" AS ENUM('PARTNER', 'CONTRACT')`);
        await queryRunner.query(`CREATE TABLE "page_content" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "page" "public"."page_content_page_enum" NOT NULL, "heroHtml" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c37811c698fc60d577a8e46943f" UNIQUE ("page"), CONSTRAINT "PK_c2b7b56ba057b319ed037ed878b" PRIMARY KEY ("id"))`);

        const pageEnumValues = Object.values(PageEnum);

        for (const page of pageEnumValues) {
            await queryRunner.query(
                `INSERT INTO "page_content" ("page", "heroHtml") VALUES ($1, $2)`,
                [page, ''],
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "page_content"`);
        await queryRunner.query(`DROP TYPE "public"."page_content_page_enum"`);
    }

}
