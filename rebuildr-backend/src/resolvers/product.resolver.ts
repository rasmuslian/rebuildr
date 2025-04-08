import { forwardRef, Inject, UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  registerEnumType,
  ResolveField,
  Resolver,
  Root,
} from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Category } from 'src/entities/category.entity';
import { Product, ProductConditionEnum } from 'src/entities/product.entity';
import { User } from 'src/entities/user.entity';
import { File } from 'src/entities/file.entity';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { CategoryService } from 'src/services/category.service';
import { FileService } from 'src/services/file.service';
import { ProductService } from 'src/services/product.service';
import { UserService } from 'src/services/user.service';
import z from 'zod';
import { GqlOptionalAuthGuard } from 'src/auth/gql-optional-auth.guard';
import { AuthedUserType } from 'src/auth/constants';
import { EventService } from 'src/services/event.service';
import { GqlThrottlerGuard } from 'src/guards/gql-throttler.guard';
import { IProductLoaders } from 'src/dataloader/product.loader';

export enum OrderProductsEnum {
  DISTANCE = 'DISTANCE',
  LATEST = 'LATEST',
}
registerEnumType(OrderProductsEnum, { name: 'OrderProductsEnum' });

@ObjectType()
class LocationResponse {
  @Field()
  latitude: number;

  @Field()
  longitude: number;
}

@InputType()
export class FileInputType {
  @Field(() => String)
  mimeType: string;
}
@InputType()
export class CreateProductInput {
  @Field()
  title: string;

  @Field()
  categoryId: string;

  @Field()
  price: number;

  @Field(() => String)
  address: string;

  @Field(() => [FileInputType], { nullable: true })
  images?: FileInputType[];

  @Field(() => Boolean, { nullable: true })
  isGiveaway?: boolean;

  @Field(() => String, { nullable: true })
  brand?: string;

  @Field({ nullable: true })
  amount?: number;

  @Field({ nullable: true })
  height?: number;

  @Field({ nullable: true })
  width?: number;

  @Field({ nullable: true })
  depth?: number;

  @Field({ nullable: true })
  volume?: number;

  @Field(() => ProductConditionEnum)
  condition: ProductConditionEnum;

  @Field(() => String, { nullable: true })
  description?: string;
}
const createProductSchema = z.object({
  title: z.string(),
  categoryId: z.string(),
  price: z.number(),
  address: z.string(),
  images: z.array(z.object({ mimeType: z.string() })).optional(),
  isGiveaway: z.boolean().optional(),
  brand: z.string().optional(),
  amount: z.number().optional(),
  height: z.number().optional(),
  width: z.number().optional(),
  depth: z.number().optional(),
  volume: z.number().optional(),
  condition: z.nativeEnum(ProductConditionEnum),
  description: z.string().optional(),
});
@ObjectType()
export class CreateProductResponse {
  @Field(() => Product)
  product: Product;

  @Field(() => [String])
  presignedPutUrls: string[];
}

@InputType()
class LocationType {
  @Field()
  longitude: number;
  @Field()
  latitude: number;
}
@InputType()
export class ProductsInput {
  @Field({ nullable: true })
  searchString?: string;

  @Field({ nullable: true })
  address?: string;

  @Field(() => LocationType, { nullable: true })
  location?: LocationType;

  @Field({ nullable: true })
  distance?: number;

  @Field({ nullable: true })
  categoryId?: string;

  @Field({ nullable: true })
  selectionCategories?: boolean;

  @Field({ nullable: true })
  seasonalCategories?: boolean;

  @Field({ nullable: true })
  giveaway?: boolean;

  @Field({ nullable: true })
  condition?: ProductConditionEnum;

  @Field(() => OrderProductsEnum, { nullable: true })
  orderBy?: OrderProductsEnum;
}

@ObjectType()
export class ProductsResponse {
  @Field(() => [Product])
  products: Product[];

  @Field(() => LocationResponse, {
    nullable: true,
    description:
      'If address or location is supplied to Products(), this will have corresponding coordinates',
  })
  origin?: LocationResponse;

  @Field(() => Int)
  total: number;
}

@InputType()
export class GetProductInput {
  @Field()
  id: string;
}

@InputType()
export class DeleteProductInput {
  @Field()
  id: string;
}

@ObjectType()
export class DeleteProductResponse {
  @Field()
  title: string;
}

@InputType()
export class HideProductInput {
  @Field()
  id: string;

  @Field()
  reason: string;
}

@InputType()
class ShowProductInput {
  @Field()
  id: string;
}

@InputType()
class SetLikeProductInput {
  @Field()
  id: string;

  @Field()
  like: boolean;
}

@Resolver(() => Product)
export class ProductResolver {
  constructor(
    @Inject(forwardRef(() => ProductService))
    private productService: ProductService,
    private userService: UserService,
    private categoryService: CategoryService,
    private fileService: FileService,
    private eventService: EventService,
  ) {}

  @Query(() => Product)
  @UseGuards(GqlOptionalAuthGuard)
  async product(
    @Args('input') input: GetProductInput,
    @CurrentUser() user?: AuthedUserType,
  ) {
    await this.eventService.recordProductVisit(input.id, user?.id);
    return this.productService.findOne(input.id);
  }

  @Query(() => ProductsResponse)
  @UseGuards(GqlOptionalAuthGuard, GqlThrottlerGuard)
  async products(
    @Args('input') input: ProductsInput,
    @Args('offset', { nullable: true, type: () => Int }) offset?: number,
    @Args('limit', { nullable: true, type: () => Int }) limit?: number,
    @CurrentUser() user?: AuthedUserType,
  ) {
    return this.productService.findAll({ ...input }, limit, offset, user?.id);
  }

  @Mutation(() => CreateProductResponse)
  @UseGuards(GqlAuthGuard, GqlThrottlerGuard)
  async createProduct(
    @CurrentUser() _user: AuthedUserType,
    @Args('input', new ZodValidationPipe(createProductSchema))
    input: CreateProductInput,
  ) {
    return this.productService.create({
      ...input,
      userId: _user.id,
    });
  }

  @Mutation(() => DeleteProductResponse)
  @UseGuards(GqlAuthGuard)
  async deleteProduct(
    @CurrentUser() _user: AuthedUserType,
    @Args('input') input: DeleteProductInput,
  ) {
    return this.productService.delete(input.id, _user.id);
  }

  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard)
  async hideProduct(
    @CurrentUser() _user: AuthedUserType,
    @Args('input') input: HideProductInput,
  ) {
    return this.productService.hide(input.id, input.reason, _user.id);
  }

  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard)
  async showProduct(
    @CurrentUser() _user: AuthedUserType,
    @Args('input') input: ShowProductInput,
  ) {
    return this.productService.show(input.id, _user.id);
  }

  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard)
  async setLikeProduct(
    @CurrentUser() _user: AuthedUserType,
    @Args('input') input: SetLikeProductInput,
  ) {
    return this.productService.setLikeProduct(input.id, input.like, _user.id);
  }

  @ResolveField(() => Category)
  async category(@Root() _product: Product) {
    return this.categoryService.findOne(_product.categoryId);
  }

  @ResolveField(() => User)
  async seller(
    @Root() _product: Product,
    @Context('productLoaders') productLoaders: IProductLoaders,
  ) {
    return productLoaders.sellerLoader.load(_product.id);
  }

  @ResolveField(() => [File])
  async images(@Root() _product: Product) {
    return this.fileService.findByProduct(_product.id);
  }

  //TODO: fetch actual mainImage and not just the first image
  @ResolveField(() => File, { nullable: true })
  async mainImage(
    @Root() _product: Product,
    @Context('productLoaders') productLoaders: IProductLoaders,
  ) {
    return productLoaders.mainImageLoader.load(_product.id);
  }

  @UseGuards(GqlOptionalAuthGuard)
  @ResolveField(() => Boolean, { nullable: true })
  async likedByUser(
    @Root() _product: Product,
    @Context('productLoaders') productLoaders: IProductLoaders,
    @CurrentUser() _user?: AuthedUserType,
  ) {
    if (!_user) {
      return null;
    }
    return productLoaders.likedByUserLoader.load({
      productId: _product.id,
      userId: _user.id,
    });
  }

  @ResolveField(() => LocationResponse)
  async location(@Root() _product: Product) {
    return {
      latitude: _product.addressLocation.coordinates[0],
      longitude: _product.addressLocation.coordinates[1],
    };
  }
}
