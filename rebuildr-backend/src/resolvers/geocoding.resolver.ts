import { UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  InputType,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { GqlThrottlerGuard } from 'src/guards/gqlThrottler.guard';
import { GeocodingService } from 'src/services/geocoding.service';

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

@Resolver()
export class GeocodingResolver {
  constructor(private geocodingService: GeocodingService) {}

  @UseGuards(GqlThrottlerGuard)
  @Query(() => GetAddressResponse)
  async locationToAddress(@Args('input') input: GetAddressInput) {
    return this.geocodingService.locationToAddress(input);
  }
}
