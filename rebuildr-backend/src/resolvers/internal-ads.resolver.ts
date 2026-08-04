import { UseGuards } from '@nestjs/common';
import {
  Args,
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
import { File } from 'src/entities/file.entity';
import { InternalAdImportBatch } from 'src/entities/internal-ad-import-batch.entity';
import { InternalAdReservation } from 'src/entities/internal-ad-reservation.entity';
import { OrganizationInvite } from 'src/entities/organization-invite.entity';
import {
  OrganizationMemberRole,
  OrganizationMembership,
} from 'src/entities/organization-membership.entity';
import { Product } from 'src/entities/product.entity';
import { User, UserRoleEnum } from 'src/entities/user.entity';
import { FileInputType } from 'src/resolvers/file.resolver';
import {
  ProductsInput,
  PaginatedProductsResponse,
} from 'src/resolvers/product.resolver';
import { InternalAdsService } from 'src/services/internal-ads.service';

@ObjectType()
class InternalAdsOrganizationContext {
  @Field(() => User)
  organization: User;

  @Field(() => OrganizationMemberRole)
  role: OrganizationMemberRole;

  @Field()
  isOrganizationAccount: boolean;
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
  async acceptOrganizationInvite(
    @Args('input') input: AcceptOrganizationInviteInput,
  ) {
    return this.internalAdsService.acceptInvite(input);
  }

  @Mutation(() => OrganizationMembership)
  @UseGuards(GqlAuthGuard)
  async updateOrganizationMemberRole(
    @CurrentUser() user: AuthedUserType,
    @Args('input') input: UpdateOrganizationMemberRoleInput,
  ) {
    return this.internalAdsService.updateMemberRole(user.id, input);
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
