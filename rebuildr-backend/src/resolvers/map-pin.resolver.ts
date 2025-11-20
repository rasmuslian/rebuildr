import { forwardRef, Inject } from "@nestjs/common";
import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { MapPin, MapPinTypeEnum } from "src/entities/map-pin.entity";
import { MapPinService } from "src/services/map-pin.service";
import { LocationResponse } from "./geocoding.resolver";

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
}