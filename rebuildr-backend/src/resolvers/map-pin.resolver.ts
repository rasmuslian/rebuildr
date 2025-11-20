import { forwardRef, Inject } from "@nestjs/common";
import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { MapPin } from "src/entities/map-pin.entity";
import { MapPinService } from "src/services/map-pin.service";

@Resolver(() => MapPin)
export class MapPinResolver {
  constructor(
    @Inject(forwardRef(() => MapPinService))
    private mapPinService: MapPinService,
  ) {}

  @ResolveField(() => Number)
  async lat(@Parent() mapPin: MapPin) {
    return mapPin.location.coordinates[0];
  }

  @ResolveField(() => Number)
  async lng(@Parent() mapPin: MapPin) {
    return mapPin.location.coordinates[1];
  }

  @ResolveField(() => String)
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