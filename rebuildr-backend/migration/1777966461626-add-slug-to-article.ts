import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSlugToArticle1777966461626 implements MigrationInterface {
    name = 'AddSlugToArticle1777966461626'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article" ADD "slug" character varying`);
        
        
        await queryRunner.query(`
          WITH ranked AS (
            SELECT id,
            ROW_NUMBER() OVER (PARTITION BY title ORDER BY "createdAt") AS rn,
            LOWER(
              REGEXP_REPLACE(
                REGEXP_REPLACE(
                  TRANSLATE(title, 'åäöÅÄÖéèêàùûâîôüë', 'aaoAAOeeeauuaiouue'),
                  '[^a-zA-Z0-9\\s]', '', 'g'
                  ),
                  '\\s+', '-', 'g'
                  )
                  ) AS base_slug
                  FROM article
                  )
                  UPDATE article a
                  SET slug = CASE
                  WHEN r.rn = 1 THEN r.base_slug
                  ELSE r.base_slug || '-' || (r.rn - 1)::text
                  END
                  FROM ranked r
                  WHERE a.id = r.id AND a.slug IS NULL
                  `);
                  
        await queryRunner.query(`ALTER TABLE "article" ALTER COLUMN "slug" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "article" ADD CONSTRAINT "UQ_0ab85f4be07b22d79906671d72f" UNIQUE ("slug")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article" DROP CONSTRAINT "UQ_0ab85f4be07b22d79906671d72f"`);
        await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "slug"`);
    }

}
