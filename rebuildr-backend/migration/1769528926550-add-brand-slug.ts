import { MigrationInterface, QueryRunner } from "typeorm";
import slugify from "slugify";

export class AddBrandSlug1769528926550 implements MigrationInterface {
    name = 'AddBrandSlug1769528926550'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "brand" ADD "slug" character varying`);
        await queryRunner.query(`ALTER TABLE "brand" ADD CONSTRAINT "UQ_f4436285f5d5785c7fb0b28b309" UNIQUE ("slug")`);

        // Merge duplicate brands
        await queryRunner.query(`
          UPDATE product p
          SET "brandId" = (Select id from brand where name = 'Lip')
          WHERE p."brandId" = (Select id from brand where name = 'LIP')
          `)
        await queryRunner.query(`
          UPDATE product p
          SET "brandId" = (Select id from brand where name = 'S:t Eriks')
          WHERE p."brandId" = (Select id from brand where name = 'S.t Eriks')
          `)
        await queryRunner.query(`
          UPDATE product p
          SET "brandId" = (Select id from brand where name = 'Elfa')
          WHERE p."brandId" = (Select id from brand where name = 'ELFA')
          `)
        await queryRunner.query(`DELETE FROM "brand" WHERE "name" = 'LIP'`);
        await queryRunner.query(`DELETE FROM "brand" WHERE "name" = 'S.t Eriks'`);
        await queryRunner.query(`DELETE FROM "brand" WHERE "name" = 'ELFA'`);
        await queryRunner.query(`
            INSERT INTO category_brands_brand("categoryId", "brandId")
             VALUES
            ((SELECT id FROM category WHERE name='Fäst & fogmassa' AND "parentId" IN (SELECT id FROM category WHERE name='Kakel & klinker') LIMIT 1),(SELECT id FROM brand WHERE name='Lip')),
            ((SELECT id FROM category WHERE name='Tätskikt' AND "parentId" IN (SELECT id FROM category WHERE name='Kakel & klinker') LIMIT 1),(SELECT id FROM brand WHERE name='Lip')),
            ((SELECT id FROM category WHERE name='Garderob & förvaring' AND "parentId" IN (SELECT id FROM category WHERE name='Interiör') LIMIT 1),(SELECT id FROM brand WHERE name='Elfa')),
            ((SELECT id FROM category WHERE name='Tegelpannor' AND "parentId" IN (SELECT id FROM category WHERE name='Tak') LIMIT 1),(SELECT id FROM brand WHERE name='S:t Eriks'));
        `)
            
        // Set slugs to current brands
        const brands: { id: string; name: string }[] = await queryRunner.query(`SELECT id, name FROM "brand"`);
        for (const brand of brands) {
            const slug = slugify(brand.name, { lower: true, strict: true, trim: true });
            await queryRunner.query(`UPDATE "brand" SET "slug" = $1 WHERE "id" = $2`, [slug, brand.id]);
        }

        // Make slug required
        await queryRunner.query(`ALTER TABLE "brand" ALTER COLUMN "slug" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "brand" DROP CONSTRAINT "UQ_f4436285f5d5785c7fb0b28b309"`);
        await queryRunner.query(`ALTER TABLE "brand" DROP COLUMN "slug"`);
    }
}
