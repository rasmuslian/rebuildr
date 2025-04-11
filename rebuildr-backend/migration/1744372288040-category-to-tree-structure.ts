import { MigrationInterface, QueryRunner } from 'typeorm';

export class CategoryToTreeStructure1744372288040
  implements MigrationInterface
{
  name = 'CategoryToTreeStructure1744372288040';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE RECURSIVE VIEW category_tree (id, ancestor_ids) AS (
        SELECT id, '{}'::uuid[]
        FROM category 
        WHERE parent_id IS NULL
      UNION ALL
        SELECT c.id, t.ancestor_ids || c.parent_id
        FROM category c, category_tree t
        WHERE c.parent_id = t.id
    )
`);
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      ['public', 'VIEW', 'category_tree', 'SELECT * from "category_tree"'],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'category_tree', 'public'],
    );
    await queryRunner.query(`DROP VIEW "category_tree"`);
  }
}
