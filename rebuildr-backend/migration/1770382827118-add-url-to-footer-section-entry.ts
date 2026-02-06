import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUrlToFooterSectionEntry1770382827118 implements MigrationInterface {
    name = 'AddUrlToFooterSectionEntry1770382827118'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "footer_section_entry" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "footer_section_entry" DROP CONSTRAINT "PK_363c704d461fb907e57acd6a384"`);

        await queryRunner.query(`CREATE TYPE "public"."footer_section_entry_type_enum" AS ENUM('ARTICLE', 'LINK')`);
        await queryRunner.query(`ALTER TABLE "footer_section_entry" ADD "type" "public"."footer_section_entry_type_enum" NOT NULL DEFAULT 'ARTICLE'`);
        await queryRunner.query(`ALTER TABLE "footer_section_entry" ALTER COLUMN "type" DROP DEFAULT`);

        await queryRunner.query(`ALTER TABLE "footer_section_entry" ALTER COLUMN "articleId" DROP NOT NULL`);


        await queryRunner.query(`ALTER TABLE "footer_section_entry" ADD "label" character varying`);
        await queryRunner.query(`ALTER TABLE "footer_section_entry" ADD "url" character varying`);

        //primary key
        await queryRunner.query(`ALTER TABLE "footer_section_entry" ADD CONSTRAINT "PK_523c3f66abb63481968318a727d" PRIMARY KEY ("id")`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "footer_section_entry" DROP CONSTRAINT "PK_523c3f66abb63481968318a727d"`);
        await queryRunner.query(`ALTER TABLE "footer_section_entry" ADD CONSTRAINT "PK_add5acd8689c8cac753796432c3" PRIMARY KEY ("articleId", "footerSectionId")`);
        await queryRunner.query(`ALTER TABLE "footer_section_entry" ALTER COLUMN "articleId" SET NOT NULL`);
        
        await queryRunner.query(`ALTER TABLE "footer_section_entry" DROP COLUMN "url"`);
        await queryRunner.query(`ALTER TABLE "footer_section_entry" DROP COLUMN "label"`);
        await queryRunner.query(`ALTER TABLE "footer_section_entry" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."footer_section_entry_type_enum"`);

        await queryRunner.query(`ALTER TABLE "footer_section_entry" DROP COLUMN "id"`);
    }

}
