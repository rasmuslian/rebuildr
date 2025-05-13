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
  Int,
  Context,
} from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Category } from 'src/entities/category.entity';
import { UserRoleEnum } from 'src/entities/user.entity';
import { File } from 'src/entities/file.entity';
import { CategoryService } from 'src/services/category.service';
import { FileService } from 'src/services/file.service';
import { ICategoryLoaders } from 'src/dataloaders/category.loader';
import { Brand } from 'src/entities/brand.entity';

@InputType()
class CategoryInput {
  @Field(() => String)
  id: string;
}

@InputType()
class PopularCategoriesInput {
  @Field(() => Int)
  limit: number;
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

@InputType()
export class GetCategoriesInput {
  @Field(() => [String], { nullable: true })
  parentIds?: string[];
}
@Resolver(() => Category)
export class CategoryResolver {
  constructor(
    private categoryService: CategoryService,
    private fileService: FileService,
  ) {}

  @Query(() => Category)
  category(@Args('input') input: CategoryInput) {
    return this.categoryService.findOne(input.id);
  }

  @Query(() => [Category])
  categories() {
    return this.categoryService.findAll();
  }

  @Query(() => [Category])
  getCategories(@Args('input') input: GetCategoriesInput) {
    return this.categoryService.findCategories(input);
  }

  @Query(() => [Category])
  rootCategories() {
    return this.categoryService.findAllRoot();
  }

  @Query(() => [Category])
  popularCategories(
    @Args('input', { nullable: true }) input?: PopularCategoriesInput,
  ) {
    return this.categoryService.findPopular(input?.limit);
  }

  @Mutation(() => Category)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  updateCategory(@Args('input') input: UpdateCategoryInput) {
    return this.categoryService.update({ ...input });
  }

  @ResolveField(() => [Category])
  children(
    @Root() _category: Category,
    @Context('categoryLoaders') categoryLoaders: ICategoryLoaders,
  ) {
    return categoryLoaders.childrenLoader.load(_category.id);
  }

  @ResolveField(() => File, { nullable: true })
  image(
    @Root() _category: Category,
    @Context('categoryLoaders') categoryLoaders: ICategoryLoaders,
  ) {
    return categoryLoaders.imageLoader.load(_category.id);
  }

  @ResolveField(() => [String])
  async ancestorIds(@Root() _category: Category) {
    return await this.categoryService.getAncestorIds(_category);
  }

  @ResolveField(() => Boolean)
  async hasChildren(@Root() _category: Category) {
    return await this.categoryService.hasChildren(_category);
  }

  @ResolveField(() => [Brand])
  async brands(
    @Root() _category: Category,
    @Context('categoryLoaders') categoryLoaders: ICategoryLoaders,
  ) {
    return await categoryLoaders.brandsLoader.load(_category.id);
  }

  @ResolveField(() => Category, { nullable: true })
  async parent(
    @Root() _category: Category,
    @Context('categoryLoaders') categoryLoaders: ICategoryLoaders,
  ) {
    if (!_category.parentId) {
      return null;
    }
    return await categoryLoaders.parentLoader.load(_category.id);
  }
}
