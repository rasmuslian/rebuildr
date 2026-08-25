import { UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Field,
  ID,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { AuthedUserType } from 'src/auth/constants';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { Category } from 'src/entities/category.entity';
import { File } from 'src/entities/file.entity';
import { InternalAdImportBatch } from 'src/entities/internal-ad-import-batch.entity';
import { InternalAdReservation } from 'src/entities/internal-ad-reservation.entity';
import { OrganizationMember } from 'src/entities/organization-member.entity';
import { Product } from 'src/entities/product.entity';
import { Project } from 'src/entities/project.entity';
import { User, UserRoleEnum } from 'src/entities/user.entity';
import { FileInputType } from 'src/resolvers/file.resolver';
import {
  ProductsInput,
  PaginatedProductsResponse,
} from 'src/resolvers/product.resolver';
import { InternalAdsService } from 'src/services/internal-ads.service';
import { LocationInputType } from './geocoding.resolver';
import { MapPinGroupsInput, MapPinGroupsResponse } from './map-pin.resolver';

@ObjectType()
class InternalAdsOrganizationContext {
  @Field(() => User)
  organization: User;

  @Field()
  canReceivePayout: boolean;
}

@ObjectType()
class InternalAdsStatistics {
  @Field()
  co2Saved: number;

  @Field()
  potentialCo2Savings: number;

  @Field()
  estimatedMarketValue: number;

  @Field(() => Int)
  totalAds: number;

  @Field(() => Int)
  externallyPublishedAds: number;
}

@ObjectType()
class InternalAdsCategory {
  @Field(() => Category)
  category: Category;

  @Field(() => Int)
  adCount: number;
}

@InputType()
class CreateOrganizationMemberInput {
  @Field()
  name: string;

  @Field()
  email: string;
}

@InputType()
class UpdateOrganizationMemberInput extends CreateOrganizationMemberInput {
  @Field(() => ID)
  id: string;
}

@ObjectType()
class CreateInternalAdImportBatchResponse {
  @Field(() => InternalAdImportBatch)
  batch: InternalAdImportBatch;

  @Field(() => [String])
  uploadUrls: string[];
}

@InputType()
class ReserveInternalAdInput {
  @Field()
  productId: string;

  @Field(() => Int, { nullable: true })
  quantity?: number;

  @Field(() => ID)
  organizationMemberId: string;
}

@InputType()
class MarkInternalAdSoldInput {
  @Field()
  productId: string;

  @Field(() => ID, { nullable: true })
  reservationId?: string;
}

@InputType()
class CreateInternalAdImportBatchInput {
  @Field(() => [FileInputType])
  files: FileInputType[];
}

@InputType()
class InternalProjectsInput {
  @Field({ nullable: true })
  searchString?: string;
}

@InputType()
class CreateInternalProjectInput {
  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => LocationInputType)
  location: LocationInputType;
}

@InputType()
class UpdateInternalProjectInput {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => LocationInputType, { nullable: true })
  location?: LocationInputType;
}

@ObjectType()
class PaginatedInternalProjectsResponse {
  @Field(() => [Project])
  projects: Project[];

  @Field(() => Int)
  total: number;
}

@InputType()
class CmsInternalAdsInput {
  @Field(() => Int, { nullable: true })
  page?: number;

  @Field(() => Int, { nullable: true })
  pageSize?: number;

  @Field({ nullable: true })
  searchString?: string;
}

@Resolver()
export class InternalAdsResolver {
  constructor(private readonly internalAdsService: InternalAdsService) {}

  @Query(() => InternalAdsOrganizationContext, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async internalAdsOrganizationContext(@CurrentUser() user: AuthedUserType) {
    return this.internalAdsService.getOptionalOrganizationContext(user.id);
  }

  @Query(() => PaginatedInternalProjectsResponse)
  @UseGuards(GqlAuthGuard)
  async internalProjects(
    @CurrentUser() user: AuthedUserType,
    @Args('input') input: InternalProjectsInput,
    @Args('limit', { nullable: true, type: () => Int }) limit?: number,
    @Args('offset', { nullable: true, type: () => Int }) offset?: number,
  ) {
    return this.internalAdsService.internalProjects(
      user.id,
      input,
      limit,
      offset,
    );
  }

  @Query(() => Project)
  @UseGuards(GqlAuthGuard)
  async internalProject(
    @CurrentUser() user: AuthedUserType,
    @Args('projectId', { type: () => ID }) projectId: string,
  ) {
    return this.internalAdsService.internalProject(user.id, projectId);
  }

  @Mutation(() => Project)
  @UseGuards(GqlAuthGuard)
  async createInternalProject(
    @CurrentUser() user: AuthedUserType,
    @Args('input') input: CreateInternalProjectInput,
  ) {
    return this.internalAdsService.createInternalProject(user.id, input);
  }

  @Mutation(() => Project)
  @UseGuards(GqlAuthGuard)
  async updateInternalProject(
    @CurrentUser() user: AuthedUserType,
    @Args('input') input: UpdateInternalProjectInput,
  ) {
    return this.internalAdsService.updateInternalProject(user.id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteInternalProject(
    @CurrentUser() user: AuthedUserType,
    @Args('projectId', { type: () => ID }) projectId: string,
  ) {
    return this.internalAdsService.deleteInternalProject(user.id, projectId);
  }

  @Query(() => InternalAdsStatistics)
  @UseGuards(GqlAuthGuard)
  async internalAdsStatistics(@CurrentUser() user: AuthedUserType) {
    return this.internalAdsService.internalAdsStatistics(user.id);
  }

  @Query(() => [InternalAdsCategory])
  @UseGuards(GqlAuthGuard)
  async internalAdsCategories(@CurrentUser() user: AuthedUserType) {
    return this.internalAdsService.internalAdsCategories(user.id);
  }

  @Query(() => PaginatedProductsResponse)
  @UseGuards(GqlAuthGuard)
  async internalAds(
    @CurrentUser() user: AuthedUserType,
    @Args('input') input: ProductsInput,
    @Args('limit', { nullable: true, type: () => Int }) limit?: number,
    @Args('offset', { nullable: true, type: () => Int }) offset?: number,
  ) {
    return this.internalAdsService.internalAds(user.id, input, limit, offset);
  }

  @Query(() => PaginatedProductsResponse)
  @UseGuards(GqlAuthGuard)
  async relatedInternalAds(
    @CurrentUser() user: AuthedUserType,
    @Args('input') input: ProductsInput,
    @Args('excludeProductIds', { nullable: true, type: () => [ID] })
    excludeProductIds?: string[],
    @Args('limit', { nullable: true, type: () => Int }) limit?: number,
    @Args('offset', { nullable: true, type: () => Int }) offset?: number,
  ) {
    return this.internalAdsService.relatedInternalAds(
      user.id,
      input,
      excludeProductIds ?? [],
      limit,
      offset,
    );
  }

  @Query(() => MapPinGroupsResponse)
  @UseGuards(GqlAuthGuard)
  async internalAdMapPinGroups(
    @CurrentUser() user: AuthedUserType,
    @Args('input') input: MapPinGroupsInput,
  ) {
    return this.internalAdsService.internalAdMapPinGroups(user.id, input);
  }

  @Query(() => Product)
  @UseGuards(GqlAuthGuard)
  async internalAd(
    @CurrentUser() user: AuthedUserType,
    @Args('productId') productId: string,
  ) {
    return this.internalAdsService.internalAd(user.id, productId);
  }

  @Query(() => [Product])
  @UseGuards(GqlAuthGuard)
  async internalAdDrafts(
    @CurrentUser() user: AuthedUserType,
    @Args('batchId', { nullable: true }) batchId?: string,
  ) {
    return this.internalAdsService.myInternalDrafts(user.id, batchId);
  }

  @Query(() => [OrganizationMember])
  @UseGuards(GqlAuthGuard)
  async organizationMembers(@CurrentUser() user: AuthedUserType) {
    return this.internalAdsService.members(user.id);
  }

  @Mutation(() => OrganizationMember)
  @UseGuards(GqlAuthGuard)
  async createOrganizationMember(
    @CurrentUser() user: AuthedUserType,
    @Args('input') input: CreateOrganizationMemberInput,
  ) {
    return this.internalAdsService.createMember(user.id, input);
  }

  @Mutation(() => OrganizationMember)
  @UseGuards(GqlAuthGuard)
  async updateOrganizationMember(
    @CurrentUser() user: AuthedUserType,
    @Args('input') input: UpdateOrganizationMemberInput,
  ) {
    return this.internalAdsService.updateMember(user.id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async removeOrganizationMember(
    @CurrentUser() user: AuthedUserType,
    @Args('memberId', { type: () => ID }) memberId: string,
  ) {
    return this.internalAdsService.removeMember(user.id, memberId);
  }

  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard)
  async createInternalAdDraft(
    @CurrentUser() user: AuthedUserType,
  ) {
    return this.internalAdsService.createInternalDraft(user.id);
  }

  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard)
  async setInternalAdResponsibleMember(
    @CurrentUser() user: AuthedUserType,
    @Args('productId', { type: () => ID }) productId: string,
    @Args('organizationMemberId', { type: () => ID }) organizationMemberId: string,
  ) {
    return this.internalAdsService.setInternalAdResponsibleMember(
      user.id,
      productId,
      organizationMemberId,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async removeInternalAdDraft(
    @CurrentUser() user: AuthedUserType,
    @Args('productId') productId: string,
  ) {
    return this.internalAdsService.removeInternalDraft(user.id, productId);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async removeInternalAdImportBatch(
    @CurrentUser() user: AuthedUserType,
    @Args('batchId') batchId: string,
  ) {
    return this.internalAdsService.removeImportBatch(user.id, batchId);
  }

  @Mutation(() => [Product])
  @UseGuards(GqlAuthGuard)
  async publishInternalAdDrafts(
    @CurrentUser() user: AuthedUserType,
    @Args('productIds', { type: () => [ID] }) productIds: string[],
  ) {
    return this.internalAdsService.publishInternalDrafts(user.id, productIds);
  }

  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard)
  async setInternalAdPublicAvailability(
    @CurrentUser() user: AuthedUserType,
    @Args('productId') productId: string,
    @Args('publiclyAvailable') publiclyAvailable: boolean,
    @Args('price', { nullable: true }) price?: number,
  ) {
    return this.internalAdsService.setInternalAdPublicAvailability(
      user.id,
      productId,
      publiclyAvailable,
      price,
    );
  }

  @Mutation(() => InternalAdReservation)
  @UseGuards(GqlAuthGuard)
  async reserveInternalAd(
    @CurrentUser() user: AuthedUserType,
    @Args('input') input: ReserveInternalAdInput,
  ) {
    return this.internalAdsService.reserveInternalAd(user.id, input);
  }

  @Mutation(() => InternalAdReservation)
  @UseGuards(GqlAuthGuard)
  async cancelInternalAdReservation(
    @CurrentUser() user: AuthedUserType,
    @Args('reservationId') reservationId: string,
  ) {
    return this.internalAdsService.cancelReservation(user.id, reservationId);
  }

  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard)
  async markInternalAdSold(
    @CurrentUser() user: AuthedUserType,
    @Args('input') input: MarkInternalAdSoldInput,
  ) {
    return this.internalAdsService.markInternalAdSold(user.id, input);
  }

  @Mutation(() => CreateInternalAdImportBatchResponse)
  @UseGuards(GqlAuthGuard)
  async createInternalAdImportBatch(
    @CurrentUser() user: AuthedUserType,
    @Args('input') input: CreateInternalAdImportBatchInput,
    @Args('organizationMemberId', { type: () => ID }) organizationMemberId: string,
  ) {
    return this.internalAdsService.createImportBatch(user.id, input.files, organizationMemberId);
  }

  @Mutation(() => InternalAdImportBatch)
  @UseGuards(GqlAuthGuard)
  async startInternalAdImportBatch(
    @CurrentUser() user: AuthedUserType,
    @Args('batchId') batchId: string,
  ) {
    return this.internalAdsService.startImportBatch(user.id, batchId);
  }

  @Query(() => InternalAdImportBatch)
  @UseGuards(GqlAuthGuard)
  async internalAdImportBatch(
    @CurrentUser() user: AuthedUserType,
    @Args('batchId') batchId: string,
  ) {
    return this.internalAdsService.importBatch(user.id, batchId);
  }

  @Query(() => PaginatedProductsResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsInternalAds(@Args('input') input: CmsInternalAdsInput) {
    return this.internalAdsService.cmsInternalAds(input);
  }
}

@Resolver(() => InternalAdReservation)
export class InternalAdReservationResolver {
  @ResolveField(() => OrganizationMember, { nullable: true })
  reservedByOrganizationMember(@Parent() reservation: InternalAdReservation) {
    return reservation.reservedByOrganizationMember;
  }
}

@Resolver(() => InternalAdImportBatch)
export class InternalAdImportBatchResolver {
  @ResolveField(() => [File])
  files(@Parent() batch: InternalAdImportBatch) {
    return batch.files ?? [];
  }

  @ResolveField(() => [Product])
  products(@Parent() batch: InternalAdImportBatch) {
    return batch.products ?? [];
  }
}
