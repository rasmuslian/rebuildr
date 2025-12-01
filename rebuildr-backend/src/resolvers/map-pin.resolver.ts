import { forwardRef, Inject, UseGuards } from "@nestjs/common";
import { Args, Context, Field, InputType, Mutation, ObjectType, Parent, Query, ResolveField, Resolver, Root } from "@nestjs/graphql";
import { MapPin, MapPinTypeEnum } from "src/entities/map-pin.entity";
import { MapPinService } from "src/services/map-pin.service";
import { LocationResponse } from "./geocoding.resolver";
import { UserRoleEnum } from "src/entities/user.entity";
import { Roles } from "src/decorators/roles.decorator";
import { GqlAuthGuard } from "src/auth/gql-auth.guard";
import { RolesGuard } from "src/auth/roles.guard";
import { ProductsInput } from "./product.resolver";
import { Product } from "src/entities/product.entity";
import { IMapPinLoaders } from "src/dataloaders/map-pin.loader";
import { GqlOptionalAuthGuard } from "src/auth/gql-optional-auth.guard";

@ObjectType()
export class MapPinGroup {
  @Field(() => String)
  id!: string;

  @Field(() => LocationResponse)
  location?: LocationResponse;

  @Field(() => [Number], { nullable: true })
  prices?: number[];

  @Field(() => MapPinTypeEnum)
  type: MapPinTypeEnum;

  @Field(() => [Product], { nullable: true })
  products?: Product[];

  @Field(() => [String], { nullable: true })
  projectIds?: string[];
}

@ObjectType()
export class ProductMapPinResponse {
  @Field(() => [MapPinGroup])
  pins: MapPinGroup[];

  @Field(() => Number)
  total: number;
}

@ObjectType()
export class MapPinResponse {
  @Field(() => [MapPin])
  mapPins: MapPin[];

  @Field(() => Number)
  total: number;
}

@InputType()
class PointInput {
  @Field()
  lat: number;

  @Field()
  lng: number;
}

@InputType()
class ProductMapPinsRadiusLocationInput {
  @Field(() => PointInput)
  point: PointInput;

  @Field()
  radius: number;

  @Field(() => ProductsInput, { nullable: true })
  productsInput?: ProductsInput;
}

@InputType()
class ProductMapPinsBoxLocationInput {
  @Field(() => PointInput)
  southWest: PointInput;

  @Field(() => PointInput)
  northEast: PointInput;

  @Field(() => ProductsInput, { nullable: true })
  productsInput?: ProductsInput;
}

@Resolver(() => MapPin)
export class MapPinResolver {
  constructor(
    @Inject(forwardRef(() => MapPinService))
    private mapPinService: MapPinService,
  ) {}

  @ResolveField(() => LocationResponse)
  async location(@Parent() mapPin: MapPin) {
    return {
      lat: mapPin.location.coordinates[0],
      lng: mapPin.location.coordinates[1],
    };
  }

  @ResolveField(() => MapPinTypeEnum, { nullable: true })
  async pinType(@Parent() mapPin: MapPin) {
    if (mapPin.product) {
      return 'PRODUCT';
    }
    if (mapPin.user) {
      return 'USER';
    }
    if (mapPin.project) {
      return 'PROJECT';
    }
    return null;
  }

  @ResolveField(() => String, { nullable: true })
  async pinTypeId(@Parent() mapPin: MapPin) {
    if (mapPin.product) {
      return mapPin.product.id;
    }
    if (mapPin.user) {
      return mapPin.user.id;
    }
    if (mapPin.project) {
      return mapPin.project.id;
    }
    return null;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async syncApproximateLocations() {
    await this.mapPinService.syncApproximateLocations();
    return true;
  }

  @Query(() => ProductMapPinResponse)
  @UseGuards(GqlOptionalAuthGuard)
  async productMapPinsInRadius(@Args('input') input: ProductMapPinsRadiusLocationInput) {
    return this.mapPinService.findProductPinsInRadius(
      input.point,
      input.radius,
      input.productsInput,
    );
  }

  @Query(() => ProductMapPinResponse)
  @UseGuards(GqlOptionalAuthGuard)
  async productMapPinsInBoundingBox(@Args('input') input: ProductMapPinsBoxLocationInput) {
    return this.mapPinService.findProductPinsInBoundingBox(
      input.southWest,
      input.northEast,
      input.productsInput,
    );
  }

  @Query(() => MapPinResponse)
  @UseGuards(GqlOptionalAuthGuard)
  async mapPinsInBoundingBox(
    @Args('southWest') southWest: PointInput,
    @Args('northEast') northEast: PointInput,
  ) {
    return this.mapPinService.findMapPinsInBoundingBox(southWest, northEast);
  }

  @ResolveField(() => Product, { nullable: true })
  async product(
    @Root() _mapPin: MapPin,
    @Context('mapPinLoaders') mapPinLoaders: IMapPinLoaders,
  ) {
    return mapPinLoaders.productLoader.load(_mapPin.id);
  }
}