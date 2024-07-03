import { Resolver, Query, InputType, Field, Args } from '@nestjs/graphql';
import { Category } from 'src/entities/category.entity';
import { CategoryService } from 'src/services/category.service';

@InputType()
class CategoryInput {
  @Field(() => String)
  id: string;
}
@Resolver(() => Category)
export class CategoryResolver {
  constructor(private categoryService: CategoryService) {}

  @Query(() => Category)
  category(@Args('input') input: CategoryInput) {
    return this.categoryService.findOne(input.id);
  }

  @Query(() => [Category])
  categories() {
    return this.categoryService.findAll();
  }

  @Query(() => [Category])
  rootCategories() {
    return this.categoryService.findAllRoot();
  }
}
