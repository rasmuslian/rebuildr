import { MigrationInterface, QueryRunner } from "typeorm";

export class ArticleFooterSectionRealtion1758266522682 implements MigrationInterface {
    name = 'ArticleFooterSectionRealtion1758266522682'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "article" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "body" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_40808690eb7b915046558c0f81b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "article_footer_section" ("articleId" uuid NOT NULL, "footerSectionId" uuid NOT NULL, "orderIndex" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_db038df9387ca16b26a9ee171e7" PRIMARY KEY ("articleId", "footerSectionId"))`);
        await queryRunner.query(`CREATE TABLE "footer_section" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "orderIndex" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_188c32901a5b9cd39fcbc910c2b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "article_footer_section" ADD CONSTRAINT "FK_1e60b82091102d5a364c003bee6" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "article_footer_section" ADD CONSTRAINT "FK_25082824366ff052a3459504977" FOREIGN KEY ("footerSectionId") REFERENCES "footer_section"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article_footer_section" DROP CONSTRAINT "FK_25082824366ff052a3459504977"`);
        await queryRunner.query(`ALTER TABLE "article_footer_section" DROP CONSTRAINT "FK_1e60b82091102d5a364c003bee6"`);
        await queryRunner.query(`DROP TABLE "footer_section"`);
        await queryRunner.query(`DROP TABLE "article_footer_section"`);
        await queryRunner.query(`DROP TABLE "article"`);
    }

}
