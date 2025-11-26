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

@ObjectType()
export class MapPinParent {
  @Field(() => [MapPin])
  pins?: MapPin[];

  @Field(() => String)
  id!: string;

  @Field(() => LocationResponse)
  location?: LocationResponse;

  @Field(() => Number)
  total: number;

  @Field(() => [Number], { nullable: true })
  prices?: number[];
}

@ObjectType()
export class MapPinResponse {
  @Field(() => [MapPinParent])
  mapPins: MapPinParent[];

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
class MapPinsRadiusLocationInput {
  @Field(() => PointInput)
  point: PointInput;

  @Field()
  radius: number;

  @Field(() => [MapPinTypeEnum], { nullable: true })
  types?: [MapPinTypeEnum];

  @Field(() => ProductsInput, { nullable: true })
  productsInput?: ProductsInput;
}

@InputType()
class MapPinsBoxLocationInput {
  @Field(() => PointInput)
  southWest: PointInput;

  @Field(() => PointInput)
  northEast: PointInput;

  @Field(() => [MapPinTypeEnum], { nullable: true })
  types?: MapPinTypeEnum[];

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

  @Query(() => MapPinResponse)
  async mapPinsInRadius(@Args('input') input: MapPinsRadiusLocationInput) {
    return this.mapPinService.findAllInRadius(
      input.point,
      input.radius,
      input.types,
      input.productsInput,
    );
  }

  @Query(() => MapPinResponse)
  async mapPinsInBoundingBox(@Args('input') input: MapPinsBoxLocationInput) {
    return this.mapPinService.findAllInBoundingBox(
      input.southWest,
      input.northEast,
      input.types,
      input.productsInput,
    );
  }


  @ResolveField(() => Product, { nullable: true })
  async product(
    @Root() _mapPin: MapPin,
    @Context('mapPinLoaders') mapPinLoaders: IMapPinLoaders,
  ) {
    return mapPinLoaders.productLoader.load(_mapPin.id);
  }
}