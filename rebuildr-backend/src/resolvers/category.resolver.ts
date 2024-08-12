import { UseGuards } from '@nestjs/common';
import {
  Resolver,
  Query,
  InputType,
  Field,
  Args,
  ResolveField,
  Root,
  Mutation,
} from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/gqlAuth.guard';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import { Category } from 'src/entities/category.entity';
import { User } from 'src/entities/user.entity';
import { CategoryService } from 'src/services/category.service';

@InputType()
class CategoryInput {
  @Field(() => String)
  id: string;
}

@InputType()
class UpdateCategoryInput {
  @Field(() => String)
  id: string;

  @Field(() => Boolean, { nullable: true })
  inSelection?: boolean;

  @Field(() => Boolean, { nullable: true })
  inSeason?: boolean;
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

  @Mutation(() => Category)
  @UseGuards(GqlAuthGuard)
  updateCategory(
    @CurrentUser() _user: User,
    @Args('input') input: UpdateCategoryInput,
  ) {
    return this.categoryService.update({ ...input }, _user.id);
  }

  @ResolveField(() => [Category])
  children(@Root() _parentCategory: Category) {
    return this.categoryService.findChildren(_parentCategory.id);
  }
}
