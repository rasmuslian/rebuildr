import { Resolver, Query } from '@nestjs/graphql';
import { Category } from 'src/entities/category.entity';
import { CategoryService } from 'src/services/category.service';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private categoryService: CategoryService) {}

  @Query(() => [Category])
  categories() {
    return this.categoryService.findAll();
  }
}
