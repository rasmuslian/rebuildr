import { ViewColumn, ViewEntity } from 'typeorm';

/** 
 * The true view is actually created from below query. Since Typeorm does not have
 * a recursive view decorator it was necessary to create is separately in a migration
 * and let this view SELECT the true view.
 * 
 * CREATE RECURSIVE VIEW category_tree (id, ancestor_ids) AS (
    SELECT id, '{}'::uuid[]
    FROM category 
    WHERE parent_id IS NULL
  UNION ALL
    SELECT c.id, t.ancestor_ids || c.parent_id
    FROM category c, category_tree t
    WHERE c.parent_id = t.id
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
