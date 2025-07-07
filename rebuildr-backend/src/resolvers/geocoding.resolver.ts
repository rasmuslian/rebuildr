import { UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  InputType,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { GqlThrottlerGuard } from 'src/guards/gql-throttler.guard';
import { GeocodingService } from 'src/services/geocoding.service';

@ObjectType()
export class LocationType {
  @Field()
  lat: number;

  @Field()
  lng: number;
}
@InputType()
export class LocationInputType {
  @Field()
  lat: number;

  @Field()
  lng: number;
}

@InputType()
export class GetAddressInput {
  @Field()
  latitude: number;

  @Field()
  longitude: number;
}
@ObjectType()
class GetAddressResponse {
  @Field(() => String)
  address: string;
}

@InputType()
class LocationSearchInput {
  @Field()
  searchString: string;
}
@ObjectType()
class LocationSearchResponse {
  @Field(() => [String])
  result: string[];
}

@InputType()
class AddressToLocationInput {
  @Field()
  address: string;
}
@ObjectType()
export class LocationResponse {
  @Field()
  lat: number;

  @Field()
  lng: number;
}

@ObjectType()
export class ApproximatePlaceResponse {
  @Field()
  lat: number;
  @Field()
  lng: number;
  @Field()
  address: string;
}

@Resolver()
export class GeocodingResolver {
  constructor(private geocodingService: GeocodingService) {}

  @UseGuards(GqlThrottlerGuard)
  @Query(() => GetAddressResponse)
  async locationToAddress(@Args('input') input: GetAddressInput) {
    return this.geocodingService.locationToAddress({
      lat: input.latitude,
      lng: input.longitude,
    });
  }

  @Query(() => LocationSearchResponse)
  async locationSearch(@Args('input') input: LocationSearchInput) {
    return this.geocodingService.placesAutoComplete(input.searchString);
  }

  @Query(() => LocationResponse)
  async addressToLocation(@Args('input') input: AddressToLocationInput) {
    return this.geocodingService.addressToLocation(input.address);
  }
}
