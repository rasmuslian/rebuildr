import { ViewColumn, ViewEntity } from 'typeorm';

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
