import { forwardRef, Inject, UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Field,
  Float,
  ID,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Parent,
  Query,
  registerEnumType,
  ResolveField,
  Resolver,
  Root,
} from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Category } from 'src/entities/category.entity';
import {
  Product,
  ProductConditionEnum,
  ProductStatus,
} from 'src/entities/product.entity';
import { User } from 'src/entities/user.entity';
import { File } from 'src/entities/file.entity';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { CategoryService } from 'src/services/category.service';
import { FileService } from 'src/services/file.service';
import { ProductService } from 'src/services/product.service';
import z from 'zod';
import { GqlOptionalAuthGuard } from 'src/auth/gql-optional-auth.guard';
import { AuthedUserType } from 'src/auth/constants';
import { EventService } from 'src/services/event.service';
import { GqlThrottlerGuard } from 'src/guards/gql-throttler.guard';
import { IProductLoaders } from 'src/dataloaders/product.loader';
import { QuantityUnitEnum } from 'src/entities/enums';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Brand } from 'src/entities/brand.entity';
import {
  ApproximatePlaceResponse,
  LocationInputType,
  LocationResponse,
} from './geocoding.resolver';
import { Project } from 'src/entities/project.entity';
import { ShippingPrice } from 'src/entities/shipping-price.entity';

export enum OrderProductsEnum {
  DISTANCE = 'DISTANCE',
  LATEST = 'LATEST',
  OLDEST = 'OLDEST',
  BEST_MATCH = 'BEST',
  PRICE_ASC = 'PRICE_ASC',
  PRICE_DESC = 'PRICE_DESC',
}
registerEnumType(OrderProductsEnum, { name: 'OrderProductsEnum' });

@InputType()
export class FileInputType {
  @Field(() => String)
  mimeType: string;

  @Field(() => String, { nullable: true })
  name?: string;
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
  brandId?: string;

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
  brandId: z.string().optional(),
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
export class UpdateProductInput {
  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => LocationInputType, { nullable: true })
  location?: LocationInputType;

  @Field(() => String, { nullable: true })
  description: string;

  @Field(() => String, { nullable: true })
  categoryId?: string | null;

  @Field(() => String, { nullable: true })
  brandId?: string | null;

  @Field({ nullable: true })
  price: number;

  @Field({ nullable: true })
  isGiveAway?: boolean;

  @Field({ nullable: true })
  primaryQuantity?: number;
  @Field(() => QuantityUnitEnum, { nullable: true })
  primaryUnit: QuantityUnitEnum;

  @Field({ nullable: true })
  secondaryQuantity?: number;
  @Field(() => QuantityUnitEnum, { nullable: true })
  secondaryUnit?: QuantityUnitEnum;

  @Field({ nullable: true })
  height?: number;

  @Field({ nullable: true })
  width?: number;

  @Field({ nullable: true })
  length?: number;

  @Field({ nullable: true })
  thickness?: number;

  @Field({ nullable: true })
  diameter?: number;

  @Field({ nullable: true })
  weight?: number;

  @Field(() => ProductConditionEnum, { nullable: true })
  condition?: ProductConditionEnum;

  @Field(() => ProductStatus, { nullable: true })
  status?: ProductStatus;

  @Field(() => [FileInputType], { nullable: true })
  addImages?: FileInputType[];

  @Field(() => [String], { nullable: true })
  removeImages?: string[];

  @Field(() => [FileInputType], { nullable: true })
  addDocuments?: FileInputType[];

  @Field(() => [String], { nullable: true })
  removeDocuments?: string[];

  @Field({ nullable: true })
  projectId?: string | null;

  @Field({ nullable: true })
  deliveryEnabled?: boolean;

  @Field({ nullable: true })
  deliveryPrice?: number;

  @Field({ nullable: true })
  deliveryRadius?: number;

  @Field({ nullable: true })
  pickupEnabled?: boolean;

  @Field(() => [String], { nullable: true })
  shippingPriceIds?: string[];
}

@ObjectType()
export class UpdateProductResponse {
  @Field(() => Product)
  product: Product;

  @Field(() => [String])
  imagePutUrls: string[];

  @Field(() => [String])
  documentPutUrls: string[];
}

@InputType()
export class ProductsInput {
  @Field({ nullable: true })
  sellerId?: string;

  @Field({ nullable: true })
  searchString?: string;

  @Field({ nullable: true })
  address?: string;

  @Field(() => LocationInputType, { nullable: true })
  location?: LocationInputType;

  @Field({ nullable: true })
  distance?: number;

  //------Transortation inputs-------
  @Field({ nullable: true })
  pickup?: boolean;

  @Field({ nullable: true })
  shipping?: boolean;

  @Field({ nullable: true })
  delivery?: boolean;
  //----------------------------------

  @Field(() => [String], { nullable: true })
  brandIds?: string[];

  @Field(() => [String], { nullable: true })
  categoryIds?: string[];

  @Field({ nullable: true })
  selectionCategories?: boolean;

  @Field({ nullable: true })
  seasonalCategories?: boolean;

  @Field({ nullable: true })
  minPrice?: number;

  @Field({ nullable: true })
  maxPrice?: number;

  @Field({ nullable: true })
  giveaway?: boolean;

  @Field(() => [ProductConditionEnum], { nullable: true })
  conditions?: ProductConditionEnum[];

  @Field(() => OrderProductsEnum, { nullable: true })
  orderBy?: OrderProductsEnum;

  @Field(() => [ID], {
    nullable: true,
  })
  likedByUserIds?: string[] | null;
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
    private categoryService: CategoryService,
    private fileService: FileService,
    private eventService: EventService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
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

  @Query(() => Product, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async getDraftedProduct(@CurrentUser() _user: AuthedUserType) {
    return await this.productService.getDraft(_user.id);
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

  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard)
  async createDraftProduct(@CurrentUser() _user: AuthedUserType) {
    return await this.productService.createDraft(_user.id);
  }

  @Mutation(() => UpdateProductResponse)
  @UseGuards(GqlAuthGuard, GqlThrottlerGuard)
  async updateProduct(
    @CurrentUser() _user: AuthedUserType,
    @Args('input') input: UpdateProductInput,
  ) {
    const childLogger = this.logger.child({
      userId: _user.id,
      productId: input.id,
    });
    return await this.productService.updateProduct(
      input,
      _user.id,
      _user.role,
      childLogger,
    );
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

  @ResolveField(() => Category, { nullable: true })
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

  @ResolveField(() => File, { nullable: true })
  async primaryImage(
    @Root() _product: Product,
    @Context('productLoaders') productLoaders: IProductLoaders,
  ) {
    return productLoaders.primaryImageLoader.load(_product.id);
  }

  @ResolveField(() => [File])
  async images(
    @Root() _product: Product,
    @Context('productLoaders') productLoaders: IProductLoaders,
  ) {
    return productLoaders.imagesLoader.load(_product.id);
  }

  @ResolveField(() => [File])
  async documents(
    @Root() _product: Product,
    @Context('productLoaders') productLoaders: IProductLoaders,
  ) {
    return productLoaders.documentsLoader.load(_product.id);
  }

  @ResolveField(() => Boolean, { nullable: true })
  @UseGuards(GqlOptionalAuthGuard)
  async likedByMe(
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

  @ResolveField(() => LocationResponse, { nullable: true })
  async location(@Root() _product: Product) {
    if (!_product.addressLocation) {
      return null;
    }
    return {
      lat: _product.addressLocation.coordinates[0],
      lng: _product.addressLocation.coordinates[1],
    };
  }

  @ResolveField(() => Float)
  async price(@Root() product: Product) {
    return product.price / 100;
  }

  @ResolveField(() => Brand, { nullable: true })
  async brand(
    @Root() _product: Product,
    @Context('productLoaders') productLoaders: IProductLoaders,
  ) {
    return productLoaders.brandLoader.load(_product.id);
  }

  @ResolveField(() => Project, { nullable: true })
  async project(
    @Root() _product: Product,
    @Context('productLoaders') productLoaders: IProductLoaders,
  ) {
    return productLoaders.projectLoader.load(_product.id);
  }

  @ResolveField(() => ApproximatePlaceResponse, { nullable: true })
  async approximatePlace(@Root() product: Product) {
    return this.productService.approximatePlace(product);
  }

  @ResolveField(() => [ShippingPrice], { nullable: true })
  async shippingPrices(
    @Root() _product: Product,
    @Context('productLoaders') productLoaders: IProductLoaders,
  ) {
    return productLoaders.shippingPricesLoader.load(_product.id);
  }

  @ResolveField(() => Float, { nullable: true })
  async deliveryPrice(@Root() product: Product) {
    if (!product.deliveryPrice) {
      return null;
    }
    return product.deliveryPrice / 100;
  }

  @ResolveField(() => Boolean)
  async canDelete(@Parent() product: Product) {
    return await this.productService.canDelete(product);
  }
}
