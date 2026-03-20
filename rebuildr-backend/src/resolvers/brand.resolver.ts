import {
  Args,
  Query,
  Resolver,
  InputType,
  ObjectType,
  Int,
  Field,
  Mutation,
  ResolveField,
  Parent,
  Context,
} from '@nestjs/graphql';
import { Brand } from 'src/entities/brand.entity';
import { BrandService } from 'src/services/brand.service';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UseGuards } from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { User, UserRoleEnum } from 'src/entities/user.entity';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { AuthedUserType } from 'src/auth/constants';
import { IBrandLoaders } from 'src/dataloaders/brand.loader';

@InputType()
export class BrandsInput {
  @Field({ nullable: true })
  name?: string;
}
@InputType()
export class ListBrandsInput {
  @Field(() => Int, { nullable: true })
  page?: number;

  @Field(() => Int, { nullable: true })
  pageSize?: number;

  @Field(() => String, { nullable: true })
  searchString?: string;
}

@ObjectType()
export class ListBrandsResponse {
  @Field(() => [Brand])
  brands: Brand[];

  @Field(() => Int)
  total: number;
}

@InputType()
export class CreateBrandInput {
  @Field(() => String)
  name: string;
}

@InputType()
export class CreateBrandByUserInput extends CreateBrandInput {
  @Field({ nullable: true })
  categoryId?: string;
}

@InputType()
export class CmsCreateBrandInput extends CreateBrandInput {}

@InputType()
export class CmsUpdateBrandInput {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;
}

@InputType()
export class CmsBrandIdInput {
  @Field()
  id: string;
}

@InputType()
export class CmsReassignBrandInput {
  @Field()
  fromBrandId: string;

  @Field()
  toBrandId: string;
}
@ObjectType()
export class CmsReassignBrandResponse {
  @Field(() => Brand)
  fromBrand: Brand;

  @Field(() => Brand)
  toBrand: Brand;
}

@Resolver(() => Brand)
export class BrandResolver {
  constructor(private brandService: BrandService) {}

  @Query(() => Brand)
  async brand(@Args('id') id: string) {
    return this.brandService.getBrand(id);
  }

  @Query(() => [Brand])
  async brands(@Args('input', { nullable: true }) input?: BrandsInput) {
    return this.brandService.brands(input);
  }

  @Query(() => ListBrandsResponse)
  @UseGuards(GqlAuthGuard)
  async listBrands(
    @Args('input') input: ListBrandsInput,
  ): Promise<ListBrandsResponse> {
    return this.brandService.listBrands(input);
  }

  @Mutation(() => Brand)
  @UseGuards(GqlAuthGuard)
  async createBrandByUser(
    @Args('input') input: CreateBrandByUserInput,
    @CurrentUser() user: AuthedUserType,
  ) {
    return this.brandService.createBrand(input, user.id);
  }

  @Mutation(() => Brand)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsCreateBrand(
    @Args('input') input: CmsCreateBrandInput,
  ): Promise<Brand> {
    return this.brandService.cmsCreateBrand(input);
  }

  @Mutation(() => Brand)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsUpdateBrand(
    @Args('input') input: CmsUpdateBrandInput,
  ): Promise<Brand> {
    return this.brandService.cmsUpdateBrand(input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsDeleteBrand(@Args('input') input: CmsBrandIdInput) {
    return await this.brandService.cmsDeleteBrand(input.id);
  }

  @Mutation(() => CmsReassignBrandResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsReassignBrand(@Args('input') input: CmsReassignBrandInput) {
    return await this.brandService.cmsReassignBrand(
      input.fromBrandId,
      input.toBrandId,
    );
  }

  @ResolveField(() => Boolean)
  async canDelete(@Parent() brand: Brand) {
    return this.brandService.canDeleteBrand(brand.id);
  }

  @ResolveField(() => User, { nullable: true })
  async createdBy(
    @Parent() brand: Brand,
    @Context('brandLoaders') brandLoaders: IBrandLoaders,
  ) {
    if (!brand.createdById) {
      return null;
    }
    return await brandLoaders.createdByLoader.load(brand.id);
  }
}
