import { ViewColumn, ViewEntity } from 'typeorm';

/** 
 * The true view is actually created from below query. Since Typeorm does not have
 * a recursive view decorator it was necessary to create is separately in a migration
 * and let this view SELECT the true view.
 * 
  CREATE RECURSIVE VIEW category_tree (id, "ancestorIds") AS (
    SELECT id, '{}'::uuid[]
    FROM category 
    WHERE "parentId" IS NULL
  UNION ALL
    SELECT c.id, t."ancestorIds" || c."parentId"
    FROM category c, category_tree t
    WHERE c."parentId" = t.id
  )
*/
@ViewEntity({
  expression: `
      SELECT * from "category_tree"
  `,
})
export class CategoryTree {
  @ViewColumn()
  id: string;

  @ViewColumn()
  ancestorIds: string[];
}
