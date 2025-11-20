import { forwardRef, Inject, UseGuards } from "@nestjs/common";
import {  Field, Mutation, ObjectType, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { MapPin, MapPinTypeEnum } from "src/entities/map-pin.entity";
import { MapPinService } from "src/services/map-pin.service";
import { LocationResponse } from "./geocoding.resolver";
import { UserRoleEnum } from "src/entities/user.entity";
import { Roles } from "src/decorators/roles.decorator";
import { GqlAuthGuard } from "src/auth/gql-auth.guard";
import { RolesGuard } from "src/auth/roles.guard";

@ObjectType()
export class MapPinResponse {
  @Field(() => [MapPin])
  mapPins: MapPin[];

  @Field(() => Number)
  total: number;
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
    if (mapPin.productId) {
      return 'PRODUCT';
    }
    if (mapPin.userId) {
      return 'USER';
    }
    if (mapPin.projectId) {
      return 'PROJECT';
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
}