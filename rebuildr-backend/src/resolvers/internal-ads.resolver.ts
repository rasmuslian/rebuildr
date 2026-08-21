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
import { GqlOptionalAuthGuard } from 'src/auth/gql-optional-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { AuthedUserType } from 'src/auth/constants';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { File } from 'src/entities/file.entity';
import { InternalAdImportBatch } from 'src/entities/internal-ad-import-batch.entity';
import { InternalAdReservation } from 'src/entities/internal-ad-reservation.entity';
import { OrganizationInvite } from 'src/entities/organization-invite.entity';
import {
  OrganizationMemberRole,
  OrganizationMembership,
} from 'src/entities/organization-membership.entity';
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

  @Field(() => OrganizationMemberRole)
  role: OrganizationMemberRole;

  @Field()
  isOrganizationAccount: boolean;

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
class OrganizationInvitePreview {
  @Field()
  organizationName: string;

  @Field(() => Date)
  expiresAt: Date;
}

@ObjectType()
class CreateInternalAdImportBatchResponse {
  @Field(() => InternalAdImportBatch)
  batch: InternalAdImportBatch;

  @Field(() => [String])
  uploadUrls: string[];
}

@InputType()
class InviteOrganizationMemberInput {
  @Field()
  email: string;

  @Field(() => OrganizationMemberRole)
  role: OrganizationMemberRole;
}

@InputType()
class AcceptOrganizationInviteInput {
  @Field()
  token: string;

  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  password?: string;
}

@InputType()
class UpdateOrganizationMemberRoleInput {
  @Field()
  userId: string;

  @Field(() => OrganizationMemberRole)
  role: OrganizationMemberRole;
}

@InputType()
class OrganizationInviteIdInput {
  @Field(() => ID)
  inviteId: string;
}

@InputType()
class RemoveOrganizationMemberInput {
  @Field(() => ID)
  userId: string;
}

@InputType()
class ReserveInternalAdInput {
  @Field()
  productId: string;

  @Field(() => Int, { nullable: true })
  quantity?: number;
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

  @Query(() => OrganizationInvitePreview, { nullable: true })
  async organizationInvite(@Args('token') token: string) {
    return this.internalAdsService.organizationInvite(token);
  }

  @Query(() => [OrganizationMembership])
  @UseGuards(GqlAuthGuard)
  async organizationMembers(@CurrentUser() user: AuthedUserType) {
    return this.internalAdsService.members(user.id);
  }

  @Query(() => [OrganizationInvite])
  @UseGuards(GqlAuthGuard)
  async organizationInvites(@CurrentUser() user: AuthedUserType) {
    return this.internalAdsService.invites(user.id);
  }

  @Mutation(() => OrganizationInvite)
  @UseGuards(GqlAuthGuard)
  async inviteOrganizationMember(
    @CurrentUser() user: AuthedUserType,
    @Args('input') input: InviteOrganizationMemberInput,
  ) {
    return this.internalAdsService.inviteMember(user.id, input);
  }

  @Mutation(() => User)
  @UseGuards(GqlOptionalAuthGuard)
  async acceptOrganizationInvite(
    @Args('input') input: AcceptOrganizationInviteInput,
    @Context('req') req: { user?: AuthedUserType },
    @CurrentUser() user?: AuthedUserType,
  ) {
    const acceptedUser = await this.internalAdsService.acceptInvite(
      input,
      user?.id,
    );

    // The mutation returns the invited user's protected email so the app can
    // log a newly created account in. Treat that user as authenticated for the
    // response fields after the invite token and password have been accepted.
    req.user = {
      id: acceptedUser.id,
      email: acceptedUser.email,
      role: acceptedUser.role,
    };
    return acceptedUser;
  }

  @Mutation(() => OrganizationMembership)
  @UseGuards(GqlAuthGuard)
  async updateOrganizationMemberRole(
    @CurrentUser() user: AuthedUserType,
    @Args('input') input: UpdateOrganizationMemberRoleInput,
  ) {
    return this.internalAdsService.updateMemberRole(user.id, input);
  }

  @Mutation(() => OrganizationInvite)
  @UseGuards(GqlAuthGuard)
  async resendOrganizationInvite(
    @CurrentUser() user: AuthedUserType,
    @Args('input') input: OrganizationInviteIdInput,
  ) {
    return this.internalAdsService.resendInvite(user.id, input.inviteId);
  }

  @Mutation(() => OrganizationInvite)
  @UseGuards(GqlAuthGuard)
  async revokeOrganizationInvite(
    @CurrentUser() user: AuthedUserType,
    @Args('input') input: OrganizationInviteIdInput,
  ) {
    return this.internalAdsService.revokeInvite(user.id, input.inviteId);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async removeOrganizationMember(
    @CurrentUser() user: AuthedUserType,
    @Args('input') input: RemoveOrganizationMemberInput,
  ) {
    return this.internalAdsService.removeMember(user.id, input.userId);
  }

  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard)
  async createInternalAdDraft(@CurrentUser() user: AuthedUserType) {
    return this.internalAdsService.createInternalDraft(user.id);
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
  ) {
    return this.internalAdsService.createImportBatch(user.id, input.files);
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

@Resolver(() => OrganizationMembership)
export class OrganizationMembershipResolver {
  @ResolveField(() => User)
  user(@Parent() membership: OrganizationMembership) {
    return membership.user;
  }

  @ResolveField(() => String, { nullable: true })
  userEmail(@Parent() membership: OrganizationMembership) {
    return membership.user.email;
  }

  @ResolveField(() => User)
  organization(@Parent() membership: OrganizationMembership) {
    return membership.organization;
  }
}

@Resolver(() => InternalAdReservation)
export class InternalAdReservationResolver {
  @ResolveField(() => User)
  reservedByUser(@Parent() reservation: InternalAdReservation) {
    return reservation.reservedByUser;
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
