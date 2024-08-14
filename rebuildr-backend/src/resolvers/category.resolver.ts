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
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Category } from 'src/entities/category.entity';
import { UserRoleEnum } from 'src/entities/user.entity';
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
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  updateCategory(@Args('input') input: UpdateCategoryInput) {
    return this.categoryService.update({ ...input });
  }

  @ResolveField(() => [Category])
  children(@Root() _parentCategory: Category) {
    return this.categoryService.findChildren(_parentCategory.id);
  }
}
