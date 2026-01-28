import {
  Args,
  Query,
  Resolver,
  InputType,
  ObjectType,
  Int,
  Field,
  Mutation,
} from '@nestjs/graphql';
import { Brand } from 'src/entities/brand.entity';
import { BrandService } from 'src/services/brand.service';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UseGuards } from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRoleEnum } from 'src/entities/user.entity';

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
export class CmsCreateBrandInput {
  @Field(() => String)
  name: string;
}

@InputType()
export class CmsUpdateBrandInput {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;
}

@Resolver()
export class BrandResolver {
  constructor(private brandService: BrandService) {}

  @Query(() => Brand)
  async brand(@Args('id') id: string) {
    return this.brandService.getBrand(id);
  }

  @Query(() => [Brand])
  async brands() {
    return this.brandService.brands();
  }

  @Query(() => ListBrandsResponse)
  async listBrands(
    @Args('input') input: ListBrandsInput,
  ): Promise<ListBrandsResponse> {
    return this.brandService.listBrands(input);
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
}
