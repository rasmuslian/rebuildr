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
  registerEnumType,
  ObjectType,
} from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Category } from 'src/entities/category.entity';
import { UserRoleEnum } from 'src/entities/user.entity';
import { File } from 'src/entities/file.entity';
import { CategoryService } from 'src/services/category.service';
import { ICategoryLoaders } from 'src/dataloaders/category.loader';
import { Brand } from 'src/entities/brand.entity';
import { FileInputType } from './file.resolver';
import { MeasurementTypeEnum } from 'src/constants/enums';
import { CO2Factor } from 'src/entities/co2-factor.entity';

export enum OrderCategoriesEnum {
  ORDER_INDEX_ASC = 'ASC',
  ORDER_INDEX_DESC = 'DESC',
}
registerEnumType(OrderCategoriesEnum, { name: 'OrderCategoriesEnum' });

@InputType()
class CategoryInput {
  @Field(() => String)
  id: string;
}
@InputType()
export class CategoriesInput {
  @Field({ nullable: true })
  seasonalCategories?: boolean;

  @Field({ nullable: true })
  trending?: boolean;
}
@InputType()
export class RootCategoriesInput {
  @Field(() => OrderCategoriesEnum, { nullable: true })
  orderBy?: OrderCategoriesEnum;
}

@InputType()
class PopularCategoriesInput {
  @Field(() => Int)
  limit: number;
}

@InputType()
class CmsBaseCategoryInput {
  @Field(() => FileInputType, { nullable: true })
  image?: FileInputType;

  @Field(() => String, { nullable: true })
  parentId?: string;

  @Field(() => [String], { nullable: true })
  brandIds?: string[];

  @Field({ nullable: true })
  co2FactorId?: string;

  @Field(() => [String], { nullable: true })
  searchAliases?: string[];
}

@InputType()
export class CmsUpdateCategoryInput extends CmsBaseCategoryInput {
  @Field(() => String)
  id: string;

  @Field(() => Boolean, { nullable: true })
  inSelection?: boolean;

  @Field(() => Boolean, { nullable: true })
  inSeason?: boolean;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => [MeasurementTypeEnum], { nullable: true })
  measurements: MeasurementTypeEnum[];
}

@InputType()
export class CmsUpdateGiveawayCategoryImageInput {
  @Field(() => FileInputType)
  image: FileInputType;
}

@InputType()
export class CmsCreateCategoryInput extends CmsBaseCategoryInput {
  @Field(() => Boolean)
  inSelection: boolean;

  @Field(() => Boolean)
  inSeason: boolean;

  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;

  @Field(() => [MeasurementTypeEnum])
  measurements: MeasurementTypeEnum[];
}

@ObjectType()
export class CmsCreateCategoryResponse {
  @Field(() => Category)
  category: Category;

  @Field(() => String, { nullable: true })
  imagePutUrl?: string;
}

@InputType()
export class CmsCategoryImportRowInput extends CmsBaseCategoryInput {
  @Field(() => String)
  clientId: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;

  @Field(() => String, { nullable: true })
  parentClientId?: string;

  @Field(() => Boolean, { defaultValue: false })
  inSelection = false;

  @Field(() => Boolean, { defaultValue: false })
  inSeason = false;

  @Field(() => [MeasurementTypeEnum], { defaultValue: [] })
  measurements: MeasurementTypeEnum[] = [];
}

@InputType()
export class CmsAnalyzeCategoryImportInput {
  @Field(() => [String])
  rows: string[];
}

@ObjectType()
export class CmsCategoryImportSuggestion {
  @Field(() => String)
  clientId: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;

  @Field(() => String, { nullable: true })
  parentId?: string;

  @Field(() => String, { nullable: true })
  parentClientId?: string;

  @Field(() => [String])
  searchAliases: string[];

  @Field(() => [MeasurementTypeEnum])
  measurements: MeasurementTypeEnum[];

  @Field(() => Boolean)
  inSelection: boolean;

  @Field(() => Boolean)
  inSeason: boolean;
}

@ObjectType()
export class CmsAnalyzeCategoryImportResponse {
  @Field(() => [CmsCategoryImportSuggestion])
  suggestions: CmsCategoryImportSuggestion[];

  @Field(() => [String])
  excluded: string[];
}

@InputType()
export class CmsCreateCategoriesInput {
  @Field(() => [CmsCategoryImportRowInput])
  categories: CmsCategoryImportRowInput[];
}

@ObjectType()
export class CmsCategoryImportResult {
  @Field(() => String)
  clientId: string;

  @Field(() => Category, { nullable: true })
  category?: Category;

  @Field(() => String, { nullable: true })
  skippedReason?: string;
}

@ObjectType()
export class CmsCreateCategoriesResponse {
  @Field(() => [CmsCategoryImportResult])
  results: CmsCategoryImportResult[];
}

@ObjectType()
export class CmsUpdateCategoryResponse {
  @Field(() => Category)
  category: Category;

  @Field(() => String, { nullable: true })
  imagePutUrl: string;
}
@InputType()
export class CmsUpdateCategoriesInput {
  @Field(() => [CmsUpdateCategoryOrderInput])
  updateInputs: CmsUpdateCategoryOrderInput[];
}
@InputType()
class CmsUpdateCategoryOrderInput {
  @Field()
  id: string;

  @Field()
  orderIndex: number;
}

@InputType()
export class GetCategoriesInput {
  @Field(() => [String], { nullable: true })
  parentIds?: string[];
}
@Resolver(() => Category)
export class CategoryResolver {
  constructor(private categoryService: CategoryService) {}

  @Query(() => Category)
  category(@Args('input') input: CategoryInput) {
    return this.categoryService.findOne(input.id);
  }

  @Query(() => [Category])
  categories(@Args('input') input: CategoriesInput) {
    return this.categoryService.findAll(input);
  }

  @Query(() => [Category])
  getCategories(@Args('input') input: GetCategoriesInput) {
    return this.categoryService.findCategories(input);
  }

  @Query(() => [Category])
  rootCategories(
    @Args('input', { nullable: true }) input?: RootCategoriesInput,
  ) {
    return this.categoryService.findAllRoot(input);
  }

  @Query(() => [Category])
  popularCategories(
    @Args('input', { nullable: true }) input?: PopularCategoriesInput,
  ) {
    return this.categoryService.findPopular(input?.limit);
  }

  @Mutation(() => CmsCreateCategoryResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  cmsCreateCategory(
    @Args('input') input: CmsCreateCategoryInput,
  ): Promise<CmsCreateCategoryResponse> {
    return this.categoryService.createCategory(input);
  }

  @Mutation(() => CmsAnalyzeCategoryImportResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  cmsAnalyzeCategoryImport(
    @Args('input') input: CmsAnalyzeCategoryImportInput,
  ): Promise<CmsAnalyzeCategoryImportResponse> {
    return this.categoryService.analyzeImport(input);
  }

  @Mutation(() => CmsCreateCategoriesResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  cmsCreateCategories(
    @Args('input') input: CmsCreateCategoriesInput,
  ): Promise<CmsCreateCategoriesResponse> {
    return this.categoryService.createCategories(input);
  }

  @Mutation(() => Category)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  cmsRegenerateCategoryImage(@Args('id') id: string): Promise<Category> {
    return this.categoryService.regenerateImage(id);
  }

  @Mutation(() => CmsUpdateCategoryResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  cmsUpdateCategory(
    @Args('input') input: CmsUpdateCategoryInput,
  ): Promise<CmsUpdateCategoryResponse> {
    return this.categoryService.updateCategory(input);
  }

  @Mutation(() => CmsUpdateCategoryResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  cmsUpdateGiveawayCategoryImage(
    @Args('input') input: CmsUpdateGiveawayCategoryImageInput,
  ): Promise<CmsUpdateCategoryResponse> {
    return this.categoryService.updateGiveawayCategoryImage(input.image);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  cmsUpdateCategoriesOrder(@Args('input') input: CmsUpdateCategoriesInput) {
    return this.categoryService.updateCategoriesOrder(input);
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

  @ResolveField(() => CO2Factor, { nullable: true })
  async co2Factor(
    @Root() _category: Category,
    @Context('categoryLoaders') categoryLoaders: ICategoryLoaders,
  ) {
    if (!_category.co2FactorId) {
      return null;
    }
    return await categoryLoaders.co2FactorLoader.load(_category.id);
  }
}
