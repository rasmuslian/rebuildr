import { forwardRef, Inject, UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { MapPinTypeEnum } from 'src/entities/map-pin.entity';
import { MapPinService } from 'src/services/map-pin.service';
import { LocationResponse } from './geocoding.resolver';
import { UserRoleEnum } from 'src/entities/user.entity';
import { Roles } from 'src/decorators/roles.decorator';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { ProductsInput } from './product.resolver';
import { GqlOptionalAuthGuard } from 'src/auth/gql-optional-auth.guard';
import { ProjectsInput } from './project.resolver';

@ObjectType()
export class MapPinGroup {
  @Field(() => LocationResponse)
  location?: LocationResponse;

  @Field(() => [Number], { nullable: true })
  prices?: number[];

  @Field(() => MapPinTypeEnum)
  type: MapPinTypeEnum;

  @Field(() => [String])
  productIds: string[];

  @Field(() => String, { nullable: true })
  projectId?: string;
}

@ObjectType()
export class MapPinGroupsResponse {
  @Field(() => [MapPinGroup])
  mapPinGroups: MapPinGroup[];

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
class MapPinGroupsInput {
  @Field(() => PointInput)
  southWest: PointInput;

  @Field(() => PointInput)
  northEast: PointInput;

  @Field(() => ProductsInput, { nullable: true })
  productsInput?: ProductsInput;

  @Field(() => ProjectsInput, { nullable: true })
  projectsInput?: ProjectsInput;

  @Field(() => Int, { nullable: true })
  zoom?: number;
}

@Resolver()
export class MapPinResolver {
  constructor(
    @Inject(forwardRef(() => MapPinService))
    private mapPinService: MapPinService,
  ) {}

  @Query(() => MapPinGroupsResponse)
  @UseGuards(GqlOptionalAuthGuard)
  async mapPinGroups(
    @Args('input') input: MapPinGroupsInput,
    @Args('offset', { nullable: true, type: () => Int }) offset?: number,
    @Args('limit', { nullable: true, type: () => Int }) limit?: number,
  ) {
    return this.mapPinService.findMapPinGroupsByBoundingBox(
      input.southWest,
      input.northEast,
      input.productsInput,
      input.projectsInput,
      input.zoom,
      offset,
      limit,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async syncApproximateLocations() {
    await this.mapPinService.syncApproximateLocations();
    return true;
  }
}
