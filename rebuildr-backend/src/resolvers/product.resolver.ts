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
  ColorTypeEnum,
  MeasurementUnitEnum,
  Product,
  ProductConditionEnum,
  ProductStatus,
  ProductAvailabilityEnum,
  ProductAvailabilityPrecisionEnum,
} from 'src/entities/product.entity';
import { User } from 'src/entities/user.entity';
import { File } from 'src/entities/file.entity';
import { CategoryService } from 'src/services/category.service';
import { ProductService } from 'src/services/product.service';
import { GqlOptionalAuthGuard } from 'src/auth/gql-optional-auth.guard';
import { AuthedUserType } from 'src/auth/constants';
import { EventService } from 'src/services/event.service';
import { GqlThrottlerGuard } from 'src/guards/gql-throttler.guard';
import { IProductLoaders } from 'src/dataloaders/product.loader';
import { QuantityUnitEnum } from 'src/constants/enums';
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
import { ServicePointResponse } from './shipping.resolver';
import { PurchaseStatusEnum } from 'src/entities/purchase.entity';
import { ReportProduct } from 'src/entities/report-product.entity';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRoleEnum } from 'src/entities/user.entity';
import { minimumProductPrice } from 'src/constants/pricing';
import { FileInputType } from './file.resolver';
import { AIService } from 'src/services/ai.service';
import { ShippingPriceService } from 'src/services/shipping-price.service';
import { SearchEnrichmentService } from 'src/services/search-enrichment.service';
import { BadUserInputException } from 'src/exceptions';

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
export class AnalyzeProductImagesInput {
  @Field()
  productId: string;
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
  description?: string;

  @Field(() => String, { nullable: true })
  additionalInfo?: string;

  @Field(() => String, { nullable: true })
  internalReferenceNumber?: string | null;

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
  @Field(() => MeasurementUnitEnum, { nullable: true })
  heightUnit?: MeasurementUnitEnum;

  @Field({ nullable: true })
  width?: number;
  @Field(() => MeasurementUnitEnum, { nullable: true })
  widthUnit?: MeasurementUnitEnum;

  @Field({ nullable: true })
  length?: number;
  @Field(() => MeasurementUnitEnum, { nullable: true })
  lengthUnit?: MeasurementUnitEnum;

  @Field({ nullable: true })
  thickness?: number;
  @Field(() => MeasurementUnitEnum, { nullable: true })
  thicknessUnit?: MeasurementUnitEnum;

  @Field({ nullable: true })
  diameter?: number;
  @Field(() => MeasurementUnitEnum, { nullable: true })
  diameterUnit?: MeasurementUnitEnum;

  @Field({ nullable: true })
  weight?: number;
  @Field(() => MeasurementUnitEnum, { nullable: true })
  weightUnit?: MeasurementUnitEnum;

  @Field({ nullable: true })
  color?: string;
  @Field(() => ColorTypeEnum, { nullable: true })
  colorType?: ColorTypeEnum;

  @Field(() => ProductConditionEnum, { nullable: true })
  condition?: ProductConditionEnum;

  @Field(() => ProductStatus, { nullable: true })
  status?: ProductStatus;

  @Field(() => ProductAvailabilityEnum, { nullable: true })
  availability?: ProductAvailabilityEnum;

  @Field(() => Date, { nullable: true })
  estimatedAvailableAt?: Date | null;

  @Field(() => ProductAvailabilityPrecisionEnum, { nullable: true })
  availabilityPrecision?: ProductAvailabilityPrecisionEnum | null;

  @Field(() => Date, { nullable: true })
  availableUntil?: Date | null;

  @Field(() => [FileInputType], { nullable: true })
  addImages?: FileInputType[];

  @Field(() => [String], { nullable: true })
  removeImages?: string[];

  @Field(() => [FileInputType], { nullable: true })
  addDocuments?: FileInputType[];

  @Field(() => [String], { nullable: true })
  removeDocuments?: string[];

  @Field({ nullable: true })
  noProject?: boolean;

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

  @Field({ nullable: true })
  soldByQuantity?: boolean;
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
export class BoundingBoxInput {
  @Field(() => LocationInputType)
  northEast: LocationInputType;

  @Field(() => LocationInputType)
  southWest: LocationInputType;
}

@InputType()
export class ProductsInput {
  @Field({ nullable: true })
  sellerId?: string;

  @Field({ nullable: true })
  projectId?: string;

  @Field({ nullable: true })
  searchString?: string;

  @Field({ nullable: true })
  address?: string;

  @Field(() => LocationInputType, { nullable: true })
  location?: LocationInputType;

  @Field({ nullable: true })
  distance?: number;

  //Restrict results to products whose location falls within the map viewport
  @Field(() => BoundingBoxInput, { nullable: true })
  boundingBox?: BoundingBoxInput;

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

  @Field(() => ProductAvailabilityEnum, { nullable: true })
  availability?: ProductAvailabilityEnum;

  @Field({ nullable: true })
  publiclyAvailable?: boolean;

  @Field(() => OrderProductsEnum, { nullable: true })
  orderBy?: OrderProductsEnum;

  @Field(() => [ID], { nullable: true })
  likedByUserIds?: string[] | null;

  @Field({ nullable: true })
  excludeOwnProducts?: boolean;

  @Field({ nullable: true })
  onlyPublished?: boolean;
}

@ObjectType()
export class PaginatedProductsResponse {
  @Field(() => [Product])
  products: Product[];

  @Field(() => Int)
  total: number;
}

@ObjectType()
export class ProductFacetCount {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class ProductFacetsResponse {
  @Field(() => [ProductFacetCount])
  categories: ProductFacetCount[];

  @Field(() => [ProductFacetCount])
  rootCategories: ProductFacetCount[];

  @Field(() => [ProductFacetCount])
  brands: ProductFacetCount[];

  @Field(() => [ProductFacetCount])
  conditions: ProductFacetCount[];
}

@ObjectType()
export class ProductsResponse extends PaginatedProductsResponse {
  @Field(() => LocationResponse, {
    nullable: true,
    description:
      'If address or location is supplied to Products(), this will have corresponding coordinates',
  })
  origin?: LocationResponse;
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
class SetLikeProductInput {
  @Field()
  id: string;

  @Field()
  like: boolean;
}

@InputType()
class RemoveProductInput {
  @Field()
  id: string;
}

@InputType()
export class GetTransportationOptionsInput {
  @Field()
  productId: string;

  @Field({ nullable: true })
  postCode?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  quantity?: number;
}

@ObjectType()
class ShippingOptionResponse {
  @Field(() => ShippingPrice)
  shippingPrice: ShippingPrice;

  @Field(() => [ServicePointResponse])
  servicePoints: ServicePointResponse[];
}

@ObjectType()
class DeliveryOptionResponse {
  @Field(() => LocationResponse)
  deliverToLocation: LocationResponse;

  @Field()
  isWithinRadius: boolean;

  @Field()
  distanceFromProduct: number;

  @Field()
  deliveryPrice: number;

  @Field({ nullable: true })
  postalCode?: string;
}

@InputType()
export class SimilarProductsInput {
  @Field()
  similarToProductId: string;
}

@InputType()
export class CmsListProductsInput {
  @Field(() => Int, { nullable: true })
  page?: number;

  @Field(() => Int, { nullable: true })
  pageSize?: number;

  @Field(() => String, { nullable: true })
  searchString?: string;
}

@ObjectType()
export class CmsListProductsResponse {
  @Field(() => [Product])
  products: Product[];

  @Field(() => Int)
  total: number;
}

@InputType()
class MeasurementInput {
  @Field({ nullable: true })
  height?: number;

  @Field(() => MeasurementUnitEnum, { nullable: true })
  heightUnit?: MeasurementUnitEnum;

  @Field({ nullable: true })
  width?: number;

  @Field(() => MeasurementUnitEnum, { nullable: true })
  widthUnit?: MeasurementUnitEnum;

  @Field({ nullable: true })
  length?: number;

  @Field(() => MeasurementUnitEnum, { nullable: true })
  lengthUnit?: MeasurementUnitEnum;

  @Field({ nullable: true })
  thickness?: number;

  @Field(() => MeasurementUnitEnum, { nullable: true })
  thicknessUnit?: MeasurementUnitEnum;

  @Field({ nullable: true })
  diameter?: number;

  @Field(() => MeasurementUnitEnum, { nullable: true })
  diameterUnit?: MeasurementUnitEnum;

  @Field({ nullable: true })
  weight?: number;

  @Field(() => MeasurementUnitEnum, { nullable: true })
  weightUnit?: MeasurementUnitEnum;
}

@InputType()
class QuantityInput {
  @Field()
  primaryQuantity: number;

  @Field(() => QuantityUnitEnum)
  primaryUnit: QuantityUnitEnum;

  @Field({ nullable: true })
  secondaryQuantity?: number;

  @Field(() => QuantityUnitEnum, { nullable: true })
  secondaryUnit?: QuantityUnitEnum;
}

@InputType()
class CmsBaseProductInput extends QuantityInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  description: string;

  @Field()
  price: number;

  @Field()
  isGiveaway: boolean;

  @Field(() => String)
  categoryId: string;

  @Field(() => String)
  brandId: string;

  @Field(() => ProductConditionEnum)
  condition: ProductConditionEnum;

  @Field({ nullable: true })
  address?: string;

  @Field()
  noProject: boolean;

  @Field({ nullable: true })
  projectId?: string;

  @Field(() => MeasurementInput, { nullable: true })
  measurement?: MeasurementInput;

  @Field()
  pickupEnabled: boolean;

  @Field()
  deliveryEnabled: boolean;

  @Field({ nullable: true })
  deliveryPrice?: number;

  @Field({ nullable: true })
  deliveryRadius?: number;

  @Field(() => [String], { nullable: true })
  shippingPriceIds?: string[];

  @Field({ nullable: true })
  color?: string;

  @Field(() => ColorTypeEnum, { nullable: true })
  colorType?: ColorTypeEnum;

  @Field({ nullable: true })
  soldByQuantity?: boolean;

  @Field(() => [String], { nullable: true })
  searchAliases?: string[];

  @Field(() => [String], { nullable: true })
  searchRelatedTerms?: string[];

  @Field(() => [String], { nullable: true })
  searchUseCases?: string[];
}

@InputType()
export class CmsCreateProductInput extends CmsBaseProductInput {
  @Field(() => [FileInputType])
  images: FileInputType[];

  @Field(() => [FileInputType])
  documents: FileInputType[];

  @Field(() => String, { nullable: true })
  sellerId?: string;
}

@ObjectType()
export class CmsCreateProductResponse {
  @Field(() => Product)
  product: Product;

  @Field(() => [String])
  imagePutUrls: string[];

  @Field(() => [String])
  documentPutUrls: string[];
}
@InputType()
export class CmsUpdateProductInput extends CmsBaseProductInput {
  @Field(() => String)
  id: string;

  @Field(() => [FileInputType], { nullable: true })
  addImages?: FileInputType[];

  @Field(() => [String], { nullable: true })
  removeImages?: string[];

  @Field(() => [FileInputType], { nullable: true })
  addDocuments?: FileInputType[];

  @Field(() => [String], { nullable: true })
  removeDocuments?: string[];
}
@ObjectType()
export class CmsUpdateProductResponse {
  @Field(() => Product)
  product: Product;

  @Field(() => [String])
  imagePutUrls: string[];

  @Field(() => [String])
  documentPutUrls: string[];
}

@ObjectType()
export class ProductPriceRangeResponse {
  @Field(() => Int)
  min: number;

  @Field(() => Int)
  max: number;
}

@ObjectType()
export class CmsSearchEnrichmentBackfillStatus {
  @Field(() => String)
  state: string;

  @Field(() => Date, { nullable: true })
  startedAt?: Date;

  @Field(() => Date, { nullable: true })
  finishedAt?: Date;

  @Field(() => Int)
  enrichedCategories: number;

  @Field(() => Int)
  enrichedProducts: number;

  @Field(() => Int)
  failedCategories: number;

  @Field(() => Int)
  failedProducts: number;

  @Field(() => Int)
  remainingCategories: number;

  @Field(() => Int)
  remainingProducts: number;

  @Field(() => String, { nullable: true })
  currentItemType?: string;

  @Field(() => String, { nullable: true })
  currentItemId?: string;

  @Field(() => String, { nullable: true })
  currentItemName?: string;

  @Field(() => Int, { nullable: true })
  currentAttempt?: number;

  @Field(() => Date, { nullable: true })
  lastProgressAt?: Date;

  @Field(() => String, { nullable: true })
  lastError?: string;
}

@Resolver(() => Product)
export class ProductResolver {
  constructor(
    @Inject(forwardRef(() => ProductService))
    private productService: ProductService,
    private categoryService: CategoryService,
    private eventService: EventService,
    private aiService: AIService,
    private shippingPriceService: ShippingPriceService,
    private searchEnrichmentService: SearchEnrichmentService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Query(() => Product)
  @UseGuards(GqlOptionalAuthGuard)
  async product(
    @Args('input') input: GetProductInput,
    @CurrentUser() user?: AuthedUserType,
  ) {
    await this.eventService.recordProductVisit(input.id, user?.id);
    return this.productService.findOne(input.id, user?.id);
  }

  @Query(() => ProductsResponse)
  @UseGuards(GqlOptionalAuthGuard)
  async products(
    @Args('input') input: ProductsInput,
    @Args('offset', { nullable: true, type: () => Int }) offset?: number,
    @Args('limit', { nullable: true, type: () => Int }) limit?: number,
    @CurrentUser() user?: AuthedUserType,
  ) {
    return this.productService.findAll({ ...input }, limit, offset, user?.id);
  }

  @Query(() => ProductFacetsResponse)
  @UseGuards(GqlOptionalAuthGuard)
  async productFacets(@Args('input') input: ProductsInput) {
    return await this.productService.productFacets({ ...input });
  }

  @Query(() => ProductsResponse)
  @UseGuards(GqlOptionalAuthGuard)
  async relatedProducts(
    @Args('input') input: ProductsInput,
    @Args('excludeProductIds', { nullable: true, type: () => [ID] })
    excludeProductIds?: string[],
    @Args('offset', { nullable: true, type: () => Int }) offset?: number,
    @Args('limit', { nullable: true, type: () => Int }) limit?: number,
    @CurrentUser() user?: AuthedUserType,
  ) {
    return this.productService.relatedProducts(
      { ...input },
      excludeProductIds ?? [],
      limit,
      offset,
      user?.id,
    );
  }

  @Query(() => Product, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async getDraftedProduct(@CurrentUser() _user: AuthedUserType) {
    return await this.productService.getDraft(_user.id);
  }

  @Query(() => Product)
  @UseGuards(GqlAuthGuard)
  async getOrCreateDraftProduct(@CurrentUser() _user: AuthedUserType) {
    return await this.productService.getOrCreateDraft(_user.id);
  }

  @Query(() => ApproximatePlaceResponse, { nullable: true })
  async getPickupOption(
    @Args('input') input: GetTransportationOptionsInput,
    @Context('productLoaders') productLoaders: IProductLoaders,
  ) {
    const product = await productLoaders.getProduct.load(input.productId);
    this.productService.assertMarketplaceProduct(product);
    if (!product.pickupEnabled) {
      return null;
    }
    const mapPin = await productLoaders.mapPinLoader.load(input.productId);
    if (!mapPin) {
      return null;
    }
    return {
      address: mapPin.address,
      lat: mapPin.location.coordinates[0],
      lng: mapPin.location.coordinates[1],
    };
  }

  @Query(() => [ShippingOptionResponse])
  async getShippingOptions(
    @Args('input') input: GetTransportationOptionsInput,
  ) {
    return this.productService.getShippingOptions(input);
  }

  @Query(() => DeliveryOptionResponse, { nullable: true })
  async getDeliveryOption(@Args('input') input: GetTransportationOptionsInput) {
    return this.productService.getDeliveryOptions(input);
  }

  @Query(() => ProductPriceRangeResponse)
  getProductPriceRange() {
    return this.productService.getProductPriceRange();
  }

  @Query(() => Product)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsGetProduct(@Args('productId') productId: string): Promise<Product> {
    return this.productService.cmsGetProduct(productId);
  }

  @Query(() => CmsListProductsResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsListProducts(
    @Args('input') input: CmsListProductsInput,
  ): Promise<CmsListProductsResponse> {
    return this.productService.cmsListProducts(input);
  }

  @Query(() => CmsSearchEnrichmentBackfillStatus)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsSearchEnrichmentBackfillStatus(): Promise<CmsSearchEnrichmentBackfillStatus> {
    return this.searchEnrichmentService.getStatus();
  }

  @Mutation(() => CmsCreateProductResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsCreateProduct(
    @Args('input') input: CmsCreateProductInput,
    @CurrentUser() user: AuthedUserType,
  ): Promise<CmsCreateProductResponse> {
    return this.productService.cmsCreateProduct(
      input,
      input.sellerId ?? user.id,
    );
  }

  @Mutation(() => CmsUpdateProductResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsUpdateProduct(
    @Args('input') input: CmsUpdateProductInput,
  ): Promise<CmsUpdateProductResponse> {
    return this.productService.cmsUpdateProduct(input);
  }

  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsHideProduct(
    @Args('productId') productId: string,
    @Args('hiddenReason') hiddenReason: string,
  ): Promise<Product> {
    return this.productService.cmsHideProduct(productId, hiddenReason);
  }

  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsUnhideProduct(
    @Args('productId') productId: string,
  ): Promise<Product> {
    return this.productService.cmsUnhideProduct(productId);
  }

  @Mutation(() => CmsSearchEnrichmentBackfillStatus)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsBackfillSearchEnrichment(): Promise<CmsSearchEnrichmentBackfillStatus> {
    return this.searchEnrichmentService.startBackfill();
  }

  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsDeleteProduct(
    @Args('productId') productId: string,
  ): Promise<Product> {
    return this.productService.cmsDeleteProduct(productId);
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
  async setLikeProduct(
    @CurrentUser() _user: AuthedUserType,
    @Args('input') input: SetLikeProductInput,
  ) {
    return this.productService.setLikeProduct(input.id, input.like, _user.id);
  }

  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard)
  async removeProduct(
    @CurrentUser() user: AuthedUserType,
    @Args('input') input: RemoveProductInput,
  ) {
    return this.productService.removeProduct(input.id, user.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteDraft(
    @CurrentUser() user: AuthedUserType,
    @Args('input') input: RemoveProductInput,
  ) {
    return this.productService.deleteDraft(input.id, user.id);
  }

  @Mutation(() => Product)
  @UseGuards(GqlThrottlerGuard)
  async analyzeProductImages(@Args('input') input: AnalyzeProductImagesInput) {
    return await this.aiService.analyzeProductImages(input);
  }

  @ResolveField(() => Category, { nullable: true })
  async category(
    @Root() _product: Product,
    @Context('productLoaders') productLoaders: IProductLoaders,
  ) {
    return productLoaders.categoryLoader.load(_product.id);
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

  @ResolveField(() => String, { nullable: true })
  async address(@Root() product: Product) {
    return await this.productService.address(product);
  }
  @ResolveField(() => LocationResponse, { nullable: true })
  async location(@Root() _product: Product) {
    return await this.productService.location(_product);
  }

  @ResolveField(() => ApproximatePlaceResponse, { nullable: true })
  async approximatePlace(
    @Root() product: Product,
    @Context('productLoaders') productLoaders: IProductLoaders,
  ) {
    const mapPin = await productLoaders.mapPinLoader.load(product.id);
    if (!mapPin) {
      return null;
    }
    return {
      address: mapPin.address,
      lat: mapPin.location.coordinates[0],
      lng: mapPin.location.coordinates[1],
    };
  }

  @ResolveField(() => [ShippingPrice], { nullable: true })
  async shippingPrices(
    @Root() _product: Product,
    @Context('productLoaders') productLoaders: IProductLoaders,
    @Args('quantity', { nullable: true, type: () => Int }) quantity?: number,
  ) {
    const prices = await productLoaders.shippingPricesLoader.load(_product.id);
    if (quantity && prices?.length) {
      const weightForQuantity = prices[0].maxWeight * quantity;
      const matchingPrice =
        await this.shippingPriceService.shippingPriceMatchingWeight(
          weightForQuantity,
        );
      if (!matchingPrice) {
        this.logger.error(
          'Product.shippingPrices: Product with quantity exceeds max weight',
        );
        throw BadUserInputException('Product exceeds max weight');
      }
      return [matchingPrice];
    }
    return prices;
  }

  @ResolveField(() => Float, { nullable: true })
  async deliveryPrice(@Root() product: Product) {
    if (product.deliveryPrice === undefined || product.deliveryPrice === null) {
      return null;
    }
    return product.deliveryPrice / 100;
  }

  @ResolveField(() => Boolean)
  async canDelete(@Parent() product: Product) {
    return await this.productService.canDelete(product);
  }

  @ResolveField(() => Int)
  async minimumPrice() {
    return Math.round(minimumProductPrice / 100);
  }

  @ResolveField(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async hasOngoingPurchase(
    @Args('includeOwnPurchases', { nullable: true })
    includeOwnPurchases: boolean,
    @Parent() product: Product,
    @Context('productLoaders') productLoaders: IProductLoaders,
    @CurrentUser() user: AuthedUserType,
  ) {
    const purchases = await productLoaders.getProductPurchases.load(product.id);

    if (includeOwnPurchases) {
      return purchases.some(
        ({ status }) => status !== PurchaseStatusEnum.FINISHED_FAILED,
      );
    }
    return purchases.some(
      ({ status, buyerId }) =>
        status !== PurchaseStatusEnum.FINISHED_FAILED && buyerId !== user.id,
    );
  }

  @ResolveField(() => [ReportProduct])
  async reportProducts(
    @Parent() product: Product,
    @Context('productLoaders') productLoaders: IProductLoaders,
  ) {
    return await productLoaders.getReportProducts.load(product.id);
  }

  @ResolveField(() => PaginatedProductsResponse)
  async similarProducts(
    @Parent() product: Product,
    @Args('offset', { nullable: true, type: () => Int }) offset?: number,
    @Args('limit', { nullable: true, type: () => Int }) limit?: number,
  ) {
    return await this.productService.similarProducts(product.id, limit, offset);
  }

  @ResolveField(() => Number, { nullable: true })
  async distanceFromLocation(
    @Parent() product: Product,
    @Context('productLoaders') productLoaders: IProductLoaders,
    @Args('location', { nullable: true }) location?: LocationInputType,
  ) {
    if (!location) return null;

    return await productLoaders.distanceToLocationLoader.load({
      productId: product.id,
      location,
    });
  }
}
