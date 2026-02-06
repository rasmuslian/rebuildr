import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameArticleFooterSectionToFooterSectionEntry1770382637726 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.renameTable("article_footer_section", "footer_section_entry");
    }
    
    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.renameTable("footer_section_entry", "article_footer_section");
    }

}
